import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { hashPassword, localOpenId, verifyPassword } from "./password";
import {
  getAllProperties,
  getPropertyById,
  getAllTransactions,
  getTransactionById,
  updateTaskCompletion,
  getAllMarketMetrics,
  getAllPriceHistory,
  getAllAiInsights,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getUserThreads,
  getThreadById,
  createThread,
  updateThreadTitle,
  deleteThread,
  getThreadMessages,
  addMessage,
  getSubmittedProperties,
  getSubmittedPropertyById,
  createSubmittedProperty,
  deleteSubmittedProperty,
  getSubmittedPropertiesForCompare,
  getUserOffers,
  getOfferById,
  getOfferByPropertyId,
  createOffer,
  updateOfferStep,
  updateOfferPrice,
  updateOfferStatus,
  updateOfferStepData,
  deleteOffer,
  getOfferNotes,
  addOfferNote,
  getUserByEmail,
  getUserByOpenId,
  upsertUser,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(120),
          email: z.string().email(),
          password: z.string().min(8).max(128),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const email = input.email.trim().toLowerCase();
        const existing = await getUserByEmail(email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists.",
          });
        }

        const openId = localOpenId(email);
        const passwordHash = await hashPassword(input.password);
        const isOwner = ENV.ownerEmail.length > 0 && email === ENV.ownerEmail;

        await upsertUser({
          openId,
          name: input.name.trim(),
          email,
          loginMethod: "local",
          passwordHash,
          role: isOwner ? "admin" : "user",
          lastSignedIn: new Date(),
        });

        const user = await getUserByOpenId(openId);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create account.",
          });
        }

        const sessionToken = await sdk.createSessionToken(openId, {
          name: user.name || input.name.trim(),
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true as const };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const email = input.email.trim().toLowerCase();
        const user = await getUserByEmail(email);

        if (!user?.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password.",
          });
        }

        await upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || email,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true as const };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Properties ──────────────────────────────────────────
  properties: router({
    list: publicProcedure.query(async () => {
      const rows = await getAllProperties();
      return rows.map((r) => ({
        ...r,
        lat: Number(r.lat),
        lng: Number(r.lng),
        change: undefined,
      }));
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const row = await getPropertyById(input.id);
        if (!row) return null;
        return {
          ...row,
          lat: Number(row.lat),
          lng: Number(row.lng),
        };
      }),
  }),

  // ─── Transactions ────────────────────────────────────────
  transactions: router({
    list: publicProcedure.query(async () => {
      return getAllTransactions();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getTransactionById(input.id);
      }),

    // NOTE: transactions carry no userId column, so this can only require a
    // signed-in caller, not per-user ownership. Scoping tasks to their owner
    // needs a schema change.
    updateTask: protectedProcedure
      .input(z.object({ taskId: z.number(), completed: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateTaskCompletion(input.taskId, input.completed);
        return { success: true };
      }),
  }),

  // ─── Market Data ─────────────────────────────────────────
  market: router({
    metrics: publicProcedure.query(async () => {
      const rows = await getAllMarketMetrics();
      return rows.map((r) => ({
        ...r,
        change: Number(r.change),
      }));
    }),

    priceHistory: publicProcedure.query(async () => {
      return getAllPriceHistory();
    }),

    aiInsights: publicProcedure.query(async () => {
      return getAllAiInsights();
    }),
  }),

  // ─── Dashboard (combined data for the main dashboard) ────
  dashboard: router({
    getData: publicProcedure.query(async () => {
      const [props, metrics, history, insights] = await Promise.all([
        getAllProperties(),
        getAllMarketMetrics(),
        getAllPriceHistory(),
        getAllAiInsights(),
      ]);
      return {
        properties: props.map((r) => ({
          ...r,
          lat: Number(r.lat),
          lng: Number(r.lng),
        })),
        metrics: metrics.map((r) => ({
          ...r,
          change: Number(r.change),
        })),
        priceHistory: history,
        aiInsights: insights,
      };
    }),
  }),

  // ─── Chat History ────────────────────────────────────────
  chatHistory: router({
    listThreads: protectedProcedure.query(async ({ ctx }) => {
      return getUserThreads(ctx.user.id);
    }),

    getThread: protectedProcedure
      .input(z.object({ threadId: z.number() }))
      .query(async ({ ctx, input }) => {
        const thread = await getThreadById(input.threadId, ctx.user.id);
        if (!thread) return null;
        const messages = await getThreadMessages(input.threadId);
        return { ...thread, messages };
      }),

    createThread: protectedProcedure
      .input(z.object({ title: z.string().optional(), propertyId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const thread = await createThread(
          ctx.user.id,
          input.title || "New Conversation",
          input.propertyId
        );
        return thread;
      }),

    renameThread: protectedProcedure
      .input(z.object({ threadId: z.number(), title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await updateThreadTitle(input.threadId, ctx.user.id, input.title);
        return { success: true };
      }),

    deleteThread: protectedProcedure
      .input(z.object({ threadId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteThread(input.threadId, ctx.user.id);
        return { success: true };
      }),

    addMessage: protectedProcedure
      .input(z.object({
        threadId: z.number(),
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Confirm the thread belongs to the caller before writing into it.
        const thread = await getThreadById(input.threadId, ctx.user.id);
        if (!thread) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Thread not found." });
        }
        const msg = await addMessage(input.threadId, input.role, input.content);
        return msg;
      }),

    // Auto-title: generate a short title from the first user message
    autoTitle: protectedProcedure
      .input(z.object({ threadId: z.number(), firstMessage: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Use OpenAI to generate a concise title
        const openaiKey = process.env.OPENAI_API_KEY;
        let title = input.firstMessage.slice(0, 50);
        if (openaiKey) {
          try {
            const resp = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: "Generate a concise 3-6 word title for this chat conversation. Return ONLY the title, no quotes or punctuation." },
                  { role: "user", content: input.firstMessage },
                ],
                max_tokens: 20,
                temperature: 0.5,
              }),
            });
            if (resp.ok) {
              const data = await resp.json();
              const generated = data.choices?.[0]?.message?.content?.trim();
              if (generated) title = generated;
            }
          } catch {
            // Fall back to truncated first message
          }
        }
        await updateThreadTitle(input.threadId, ctx.user.id, title);
        return { title };
      }),
  }),

  // ─── Submitted Properties ────────────────────────────────
  submittedProperties: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const rows = await getSubmittedProperties(ctx.user.id);
      return rows.map((r) => ({
        ...r,
        lat: r.lat ? Number(r.lat) : null,
        lng: r.lng ? Number(r.lng) : null,
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const row = await getSubmittedPropertyById(input.id, ctx.user.id);
        if (!row) return null;
        return {
          ...row,
          lat: row.lat ? Number(row.lat) : null,
          lng: row.lng ? Number(row.lng) : null,
        };
      }),

    submit: protectedProcedure
      .input(z.object({ sourceUrl: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        // Detect platform from URL
        let platform = "unknown";
        if (input.sourceUrl.includes("idealista")) platform = "idealista";
        else if (input.sourceUrl.includes("imovirtual")) platform = "imovirtual";
        else if (input.sourceUrl.includes("sapo.pt")) platform = "sapo";
        else if (input.sourceUrl.includes("remax")) platform = "remax";
        else if (input.sourceUrl.includes("century21")) platform = "century21";

        const result = await createSubmittedProperty({
          userId: ctx.user.id,
          sourceUrl: input.sourceUrl,
          sourcePlatform: platform,
          status: "pending",
        });
        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteSubmittedProperty(input.id, ctx.user.id);
        return { success: true };
      }),

    compare: protectedProcedure
      .input(z.object({ ids: z.array(z.number()).min(2).max(4) }))
      .query(async ({ ctx, input }) => {
        const rows = await getSubmittedPropertiesForCompare(input.ids, ctx.user.id);
        return rows.map((r) => ({
          ...r,
          lat: r.lat ? Number(r.lat) : null,
          lng: r.lng ? Number(r.lng) : null,
        }));
      }),
  }),

  // ─── Offers (Buying Flow) ─────────────────────────────────
  offers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserOffers(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const offer = await getOfferById(input.id, ctx.user.id);
        if (!offer) return null;
        // Also fetch the property details
        const property = await getSubmittedPropertyById(offer.propertyId, ctx.user.id);
        const notes = await getOfferNotes(offer.id);
        return { ...offer, property, notes };
      }),

    getByPropertyId: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getOfferByPropertyId(input.propertyId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Check if offer already exists for this property
        const existing = await getOfferByPropertyId(input.propertyId, ctx.user.id);
        if (existing) return existing;
        const offer = await createOffer({
          userId: ctx.user.id,
          propertyId: input.propertyId,
          currentStep: "analysis",
          status: "active",
        });
        // Add system note
        if (offer) {
          await addOfferNote(offer.id, ctx.user.id, "Buying process started", "system");
        }
        return offer;
      }),

    completeStep: protectedProcedure
      .input(z.object({
        offerId: z.number(),
        step: z.enum(["analysis", "negotiation", "due_diligence", "make_offer", "completion"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateOfferStep(input.offerId, ctx.user.id, input.step, true);
        const stepLabels: Record<string, string> = {
          analysis: "Analysis Review",
          negotiation: "Negotiation Strategy",
          due_diligence: "Due Diligence",
          make_offer: "Offer Submission",
          completion: "Purchase Completion",
        };
        await addOfferNote(
          input.offerId,
          ctx.user.id,
          `Completed: ${stepLabels[input.step]}`,
          "milestone"
        );
        return { success: true };
      }),

    updatePrice: protectedProcedure
      .input(z.object({
        offerId: z.number(),
        offerPrice: z.number().optional(),
        counterOfferPrice: z.number().optional(),
        finalPrice: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { offerId, ...priceData } = input;
        await updateOfferPrice(offerId, ctx.user.id, priceData);
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        offerId: z.number(),
        status: z.enum(["active", "offer_sent", "accepted", "rejected", "withdrawn", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateOfferStatus(input.offerId, ctx.user.id, input.status);
        await addOfferNote(
          input.offerId,
          ctx.user.id,
          `Status changed to: ${input.status.replace("_", " ")}`,
          "system"
        );
        return { success: true };
      }),

    updateStepData: protectedProcedure
      .input(z.object({
        offerId: z.number(),
        step: z.enum(["analysis", "negotiation", "due_diligence", "make_offer", "completion"]),
        data: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateOfferStepData(input.offerId, ctx.user.id, input.step, input.data);
        return { success: true };
      }),

    addNote: protectedProcedure
      .input(z.object({
        offerId: z.number(),
        content: z.string(),
        noteType: z.enum(["note", "milestone", "system"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const note = await addOfferNote(
          input.offerId,
          ctx.user.id,
          input.content,
          input.noteType || "note"
        );
        return note;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteOffer(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Favorites ───────────────────────────────────────────
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserFavorites(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await addFavorite(ctx.user.id, input.propertyId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeFavorite(ctx.user.id, input.propertyId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

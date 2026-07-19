import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  token: z.string(),
});

export const Route = createFileRoute("/api/setup-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const parsed = setupSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Invalid input" }, { status: 400 });
        }

        const { email, password, token } = parsed.data;
        if (token !== process.env.SETUP_TOKEN) {
          return Response.json({ error: "Invalid setup token" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Check if any admin already exists
        const { data: existingAdmins } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("role", "admin")
          .limit(1);

        if (existingAdmins && existingAdmins.length > 0) {
          return Response.json({ error: "Admin already exists" }, { status: 409 });
        }

        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError || !userData.user) {
          console.error("Error creating user:", createError);
          return Response.json({ error: createError?.message || "Failed to create user" }, { status: 500 });
        }

        const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
          user_id: userData.user.id,
          role: "admin",
        });

        if (roleError) {
          console.error("Error assigning admin role:", roleError);
          return Response.json({ error: roleError.message }, { status: 500 });
        }

        return Response.json({ ok: true, userId: userData.user.id });
      },
    },
  },
});

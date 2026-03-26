import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function addAdmin() {
    const email = "admin@demo.com";
    const password = "admin@123";
    const name = "Admin User";
    const role = "admin";

    console.log(`Checking if user ${email} exists...`);
    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
        console.log(`User ${email} already exists. Updating role to admin and resetting password...`);
        const { error } = await supabase
            .from("users")
            .update({
                password_hash: hashedPassword,
                role: role,
                name: name
            })
            .eq("id", existingUser.id);

        if (error) {
            console.error("Error updating user:", error);
        } else {
            console.log("Admin user updated successfully!");
        }
    } else {
        console.log(`Creating new admin user: ${email}...`);
        const { error } = await supabase
            .from("users")
            .insert({
                name,
                email,
                password_hash: hashedPassword,
                role
            });

        if (error) {
            console.error("Error creating user:", error);
        } else {
            console.log("Admin user created successfully!");
        }
    }
}

addAdmin().catch(console.error);

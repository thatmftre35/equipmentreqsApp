import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-927e49ee/health", (c) => {
  return c.json({ status: "ok" });
});

// Submit call off form
app.post("/make-server-927e49ee/submit-calloff", async (c) => {
  try {
    const body = await c.req.json();
    const { name, project, equipmentType, model, callOffDate, recipientEmail } = body;

    // Send email
    const emailResult = await sendEmail(
      recipientEmail,
      "Equipment Call Off Notification",
      `
        <h2>Equipment Call Off Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Project:</strong> ${project}</p>
        <p><strong>Equipment Type:</strong> ${equipmentType}</p>
        <p><strong>Model:</strong> ${model}</p>
        <p><strong>Call Off Date:</strong> ${callOffDate}</p>
      `
    );

    if (!emailResult.success) {
      console.error(`Error sending call off email: ${emailResult.error}`);
      return c.json({ error: `Failed to send email: ${emailResult.error}` }, 500);
    }

    return c.json({ success: true, message: "Call off submitted successfully" });
  } catch (error) {
    console.error(`Error in submit-calloff endpoint: ${error}`);
    return c.json({ error: `Server error while submitting call off: ${error.message}` }, 500);
  }
});

// Submit rental request form
app.post("/make-server-927e49ee/submit-rental", async (c) => {
  try {
    const body = await c.req.json();
    const { name, project, equipmentType, model, requiredByDate, expectedReturnDate, recipientEmail } = body;

    const emailResult = await sendEmail(
      recipientEmail,
      "Rental Equipment Request",
      `
        <h2>Rental Equipment Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Project:</strong> ${project}</p>
        <p><strong>Equipment Type:</strong> ${equipmentType}</p>
        <p><strong>Model:</strong> ${model}</p>
        <p><strong>Required By Date:</strong> ${requiredByDate}</p>
        <p><strong>Expected Return Date:</strong> ${expectedReturnDate}</p>
      `
    );

    if (!emailResult.success) {
      console.error(`Error sending rental request email: ${emailResult.error}`);
      return c.json({ error: `Failed to send email: ${emailResult.error}` }, 500);
    }

    return c.json({ success: true, message: "Rental request submitted successfully" });
  } catch (error) {
    console.error(`Error in submit-rental endpoint: ${error}`);
    return c.json({ error: `Server error while submitting rental request: ${error.message}` }, 500);
  }
});

// Submit owned equipment request form
app.post("/make-server-927e49ee/submit-owned", async (c) => {
  try {
    const body = await c.req.json();
    const { name, project, equipment, recipientEmail } = body;

    const equipmentList = equipment.map((item: any) => 
      `<li><strong>Type:</strong> ${item.equipmentType}, <strong>Model:</strong> ${item.model}, <strong>Required By:</strong> ${item.requiredByDate}, <strong>Expected Return:</strong> ${item.expectedReturnDate}</li>`
    ).join('');

    const emailResult = await sendEmail(
      recipientEmail,
      "Owned Equipment Request",
      `
        <h2>Owned Equipment Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Project:</strong> ${project}</p>
        <p><strong>Equipment Requested:</strong></p>
        <ul>${equipmentList}</ul>
      `
    );

    if (!emailResult.success) {
      console.error(`Error sending owned equipment request email: ${emailResult.error}`);
      return c.json({ error: `Failed to send email: ${emailResult.error}` }, 500);
    }

    return c.json({ success: true, message: "Owned equipment request submitted successfully" });
  } catch (error) {
    console.error(`Error in submit-owned endpoint: ${error}`);
    return c.json({ error: `Server error while submitting owned equipment request: ${error.message}` }, 500);
  }
});

// Get projects
app.get("/make-server-927e49ee/projects", async (c) => {
  try {
    const projects = await kv.get("projects:list");
    return c.json({ projects: projects || [] });
  } catch (error) {
    console.error(`Error fetching projects: ${error}`);
    return c.json({ error: `Failed to fetch projects: ${error.message}` }, 500);
  }
});

// Save projects
app.post("/make-server-927e49ee/projects", async (c) => {
  try {
    const { projects } = await c.req.json();
    await kv.set("projects:list", projects);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error saving projects: ${error}`);
    return c.json({ error: `Failed to save projects: ${error.message}` }, 500);
  }
});

// Get equipment
app.get("/make-server-927e49ee/equipment", async (c) => {
  try {
    const equipment = await kv.get("equipment:list");
    return c.json({ equipment: equipment || [] });
  } catch (error) {
    console.error(`Error fetching equipment: ${error}`);
    return c.json({ error: `Failed to fetch equipment: ${error.message}` }, 500);
  }
});

// Save equipment
app.post("/make-server-927e49ee/equipment", async (c) => {
  try {
    const { equipment } = await c.req.json();
    await kv.set("equipment:list", equipment);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error saving equipment: ${error}`);
    return c.json({ error: `Failed to save equipment: ${error.message}` }, 500);
  }
});

// Email sending helper function using Resend API
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      return { success: false, error: "RESEND_API_KEY environment variable not set" };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Equipment Requests <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `Resend API error: ${errorData}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

Deno.serve(app.fetch);
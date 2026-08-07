const API_KEY = "1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo";
const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

async function seedSettings() {
    console.log("🚀 Seeding Decorwish Settings...\n");

    const settingsData = {
        auth: {
            default: "google",
            active: {
                mail: false,
                mobile: false,
                whatsapp: false,
                google: true
            }
        },
        payment: {
            default: "razorpay",
            active: {
                razorpay: true,
                payu: false
            }
        },
        callback: true,
        contact: {
            mobile: { label: "Mobile", contact: "+91 7027463786" },
            whatsapp: { label: "WhatsApp", contact: "+91 7027463786" },
            mail: { label: "Email", contact: "info@decorwish.com" },
            address: { label: "Address", contact: "123 Business Street, City, State, India" }
        },
        social: [],
        createdBy: "system",
        updatedBy: "system"
    };

    try {
        const response = await fetch(`${BASE_URL}/api/admin/setting`, {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(settingsData)
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Settings seeded successfully!");
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log("❌ Failed to seed settings:", data.message || data.error);
            console.log("Status:", response.status);
        }
    } catch (error) {
        console.error("❌ Error seeding settings:", error.message);
    }
}

seedSettings();

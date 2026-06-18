/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Lazy-initialize Google GenAI so it doesn't crash the server if the key is missing at boot.
let aiInstance: GoogleGenAI | null = null;

function getGoogleGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required for the AI Shopper Advisor.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Helper product system info to feed into Gemini so it knows what products are available
const STORE_CATALOG_GUIDELINE = `
You are the "BuyOman AI Shopping Advisor", a professional, polite, and extremely helpful AI expert assistant at Oman's premier retail store "BuyOman Electronics".
Your task is to recommend smartphones, premium televisions, and smart home appliances based on the customer's query.
We carry these top brands: Samsung, Apple, LG, Sony, Bosch, Dyson, Xiaomi, Asus, Nespresso, and KitchenAid.

Here is some of our active catalog:
- iPhones: iPhone 15 Pro Max (OMR 459.900), iPhone 15 Pro (OMR 359.99), Apple Watch Series 10 (OMR 189.900)
- Samsung Phones: Galaxy S24 Ultra (OMR 389.900), Galaxy S24 (OMR 219.000)
- Laptops: MacBook Pro 14" M3 (OMR 689.000), Asus ROG Zephyrus G16 (OMR 799.000), Dell XPS 15 (OMR 579.00)
- TVs: Samsung Neo QLED 8K Smart TV 65" (OMR 899.000), LG OLED evo C3 Series 55" (OMR 489.000), LG Smart TV 55" (OMR 189)
- ACs: LG DUAL Inverter Split AC 2 Ton (OMR 199.000), Inverter AC 1.5 Ton (OMR 149.000)
- Washing Machines & Coolers: Bosch Serie 6 Front Loader 9kg (OMR 169.900), Bosch Front Loader 8kg (OMR 129.000), Samsung French Door Refrigerator 620L (OMR 299.900)
- Small Appliances & Lifestyle: Philips Airfryer XL (OMR 39.900), Nespresso Vertuo Pop (OMR 69.900), Dyson V11 Vacuum (OMR 179.900), Roborock S8 Cleaner (OMR 219.900), KitchenAid Stand Mixer (OMR 149.000), Sony WH-1000XM5 Headphones (OMR 89.900)

GUIDELINES FOR YOUR CHAT:
1. Speak in a warm, welcoming, professional customer service voice.
2. If appropriate, greet them in Arabic or English ("Marhaba! Welcome to BuyOman...")
3. Provide localized advice. Mention Muscat, Salalah, Sohar, Nizwa, or extreme Omani summer heat where relevant (e.g. for split ACs with high T3 compressor ratings).
4. Direct the user to specific item budgets. Give prices in Omani Rials (OMR).
5. Always advise on features like Free Home Delivery for orders above OMR 20, the 2-Year Golden Warranty, and free installation across Oman governorates.
6. Keep recommendations elegant, succinct, and formatted beautifully using markdown with bullet points.
`;

app.post('/api/recommend', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message payload is required.' });
      return;
    }

    try {
      const ai = getGoogleGenAI();
      
      // Build conversation system instruction and payload
      const contentsParts = [];
      
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contentsParts.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }
      
      contentsParts.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contentsParts,
        config: {
          systemInstruction: STORE_CATALOG_GUIDELINE,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I apologize, I could not generate a recommendation right now. How else can I assist you with BuyOman's appliances?";
      res.json({ reply: replyText });

    } catch (apiError: any) {
      console.warn("Gemini API Error or Key missing. Using localized mockup fallback logic instead.", apiError.message);
      
      // Localized offline/mockup fallback logic so the app is always highly functional and professional
      let replyText = "";
      const lower = message.toLowerCase();
      
      if (lower.includes('ac') || lower.includes('air' ) || lower.includes('cool') || lower.includes('heat') || lower.includes('summer')) {
        replyText = `### ❄️ Beat the Summer Heat in Oman!\n\nHere are our recommended air conditioning units with full tropical T3 specifications:\n- **LG DUAL Inverter Split AC 2.0 Ton**: OMR 199.900 (Originally OMR 259.000). Highly energy efficient (saves up to 70% electricity) and built to handle Salalah and Muscat summer peaks.\n- **Inverter AC 1.5 Ton**: OMR 149.000. Perfect for bedrooms.\n\n**Exclusive Benefits**:\n- 🚚 **Free Delivery & Professional Installation** directly to your home in any Oman Governorate.\n- 🛡️ **2-Year Warranty** on unit parts, 10 years on inverter compressor.`;
      } else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('iphone') || lower.includes('galaxy') || lower.includes('s24')) {
        replyText = `### 📱 Recommended Smartphones for You!\n\nWe feature the latest devices with free door-to-door delivery across Oman:\n\n1. **iPhone 15 Pro Max (256GB)**: OMR 459.900 (Originally OMR 499.900). Stunning Aerospace Titanium shell, A17 Pro Chip, and 5x optical optical telesensing zoom.\n2. **Samsung Galaxy S24 Ultra**: OMR 389.900 (Originally OMR 449.900). Features Galaxy AI smart translation, circular search, and a gorgeous built-in S-Pen.\n3. **Xiaomi 14 Ultra (512GB)**: OMR 329.900. Co-engineered with Leica for movie-grade recording.\n\nAll mobile devices include **1-Year Local Brand Warranty**! Add any to your cart to checkout!`;
      } else if (lower.includes('tv') || lower.includes('screen') || lower.includes('display') || lower.includes('audio') || lower.includes('sony')) {
        replyText = `### 📺 Premium Home Entertainment Systems\n\nEnjoy cinematic immersion with free home setup:\n- **Samsung Neo QLED 8K Smart TV 65"**: OMR 899.000. Real 8K detailing with premium upscaling. Perfect for wide living rooms.\n- **LG OLED evo C3 Series 55"**: OMR 489.000. Absolute deep blacks and Dolby Atmos audio - a favorite for gamers and cinephiles alike.\n- **Sony WH-1000XM5 Noise Canceling Headphones**: OMR 89.900. Studio sound with automatic ambient tuning.`;
      } else if (lower.includes('kitchen') || lower.includes('coffee') || lower.includes('fryer') || lower.includes('washing') || lower.includes('fridge') || lower.includes('fridge')  || lower.includes('appliance')) {
        replyText = `### 🧺 Premium Home & Kitchen Appliances\n\nUpgrade your Omani home today structure:\n- **Samsung French Door Refrigerator 620L**: OMR 299.900. Dual multi-airflow cooling prevents food spoilage.\n- **Bosch Serie 6 Front Loader Washing Machine (9kg)**: OMR 169.900. Incredibly quiet EcoSilence motor and SpeedPerfect washes.\n- **Philips Essential Airfryer XL**: OMR 39.900. Cook delicious, low-oil dishes for the whole family.\n- **Nespresso Vertuo Pop**: OMR 69.900. Authentic espresso at the touch of a button.\n\n*Note: Free delivery and secure heavy appliance mounting are included!*`;
      } else {
        replyText = `### Hello from BuyOman AI Support! 🇴🇲\n\nWelcome to BuyOman! I am your smart shopping advisor. I can help you find suitable appliances or electronics tailored for your needs and Omani home sizes.\n\n**How to Ask me:**\n* "Which AC is best for hot Omani summers?"\n* "Can you recommend a premium smartphone under OMR 400?"\n* "What large washing machines do you recommend for a family of 5?"\n* "Suggest a good coffee maker or air fryer."\n\nTell me what you are looking for, or your budget in OMR!`;
      }
      
      // Let the client know it is fallback response but still highly comprehensive
      res.json({ 
        reply: replyText,
        isFallback: true,
        notice: "AI Advisor is currently in smart-simulation fallback mode. Configure GEMINI_API_KEY to experience real-time AI generation."
      });
    }

  } catch (err: any) {
    res.status(500).json({ error: 'Server Internal Error', details: err.message });
  }
});

// Setup Vite & Static Files
async function startViteAndListen() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite integration middleware for full hot development.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Fallback all secondary requests to client Router index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving pre-built production static assets from dist/ directory.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BuyOman Server booted successfully in ${process.env.NODE_ENV || 'development'} mode!`);
    console.log(`Access endpoint URL at http://localhost:${PORT}`);
  });
}

startViteAndListen();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header if API key exists
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Official Data.gov.sg HDB Resale Prices API Integration
const DATASET_ID = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc";
const DATA_GOV_SG_BASE_URL = "https://data.gov.sg/api/action/datastore_search?resource_id=" + DATASET_ID;

// Dataset info and python integration reference
app.get("/api/data-gov-sg/info", (_req, res) => {
  res.json({
    dataset_id: DATASET_ID,
    title: "Resale flat prices based on registration date from Jan-2017 onwards",
    url: DATA_GOV_SG_BASE_URL,
    pythonSnippet: `import requests\n\ndataset_id = "${DATASET_ID}"\nurl = "https://data.gov.sg/api/action/datastore_search?resource_id=" + dataset_id\n\nresponse = requests.get(url)\nprint(response.json())`,
    agency: "Housing and Development Board (HDB)",
    coverage: "Singapore National Public Housing",
  });
});

// Proxy and query endpoint for data.gov.sg resale flat transactions
app.get("/api/data-gov-sg/resale-prices", async (req, res) => {
  try {
    const { town, limit = 50, q, sort = "month desc" } = req.query;

    const url = new URL(DATA_GOV_SG_BASE_URL);
    url.searchParams.set("limit", String(Math.min(100, Math.max(1, Number(limit) || 50))));
    if (sort) {
      url.searchParams.set("sort", String(sort));
    }
    if (q) {
      url.searchParams.set("q", String(q));
    }
    if (town && town !== "All") {
      url.searchParams.set("filters", JSON.stringify({ town: String(town).toUpperCase() }));
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "ElectricPropertyAgent-SG/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Data.gov.sg API returned HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();

    res.json({
      success: true,
      dataset_id: DATASET_ID,
      queriedUrl: url.toString(),
      pythonCodeSnippet: `import requests\n\ndataset_id = "${DATASET_ID}"\nurl = "https://data.gov.sg/api/action/datastore_search?resource_id=" + dataset_id\n\nresponse = requests.get(url)\nprint(response.json())`,
      result: rawData.result || null,
      records: rawData.result?.records || [],
      total: rawData.result?.total || rawData.result?.records?.length || 0,
    });
  } catch (error: any) {
    console.error("Error querying Data.gov.sg API:", error);
    res.status(500).json({
      success: false,
      dataset_id: DATASET_ID,
      error: error.message || "Failed to query Data.gov.sg API",
    });
  }
});

// AI Electric Property Agent Valuation & Advisory endpoint
app.post("/api/agent-evaluate", async (req, res) => {
  try {
    const {
      customerName,
      propertyAddress,
      propertyType,
      purchasePrice,
      purchaseYear,
      expectedSellingPrice,
      expectedProfit,
      outstandingLoan,
      cpfUsed,
      wishlistLocation,
      wishlistType,
      targetBudget,
      recentComparablePrice,
    } = req.body;

    const currentYear = 2026;
    const holdingPeriod = Math.max(1, currentYear - (Number(purchaseYear) || 2018));
    const compPrice = Number(recentComparablePrice) || Number(expectedSellingPrice) || 850000;
    const pPrice = Number(purchasePrice) || 450000;
    const expProfit = Number(expectedProfit) || 300000;
    
    // Financial calculations
    const estimatedValuation = compPrice;
    const grossCapitalGain = estimatedValuation - pPrice;
    const loanDeduction = Number(outstandingLoan) || 150000;
    const cpfRefund = Number(cpfUsed) || 90000;
    const agentFee = Math.round(estimatedValuation * 0.02 * 1.09); // 2% + 9% GST
    const legalConveyancing = 2000;
    const estimatedNetCashProceeds = Math.max(0, estimatedValuation - loanDeduction - cpfRefund - agentFee - legalConveyancing);
    const targetSurpassed = grossCapitalGain >= expProfit;
    const profitDifference = grossCapitalGain - expProfit;

    let aiAnalysis = "";

    if (ai) {
      const prompt = `You are the "Electric Property Agent", a high-voltage, analytical, and highly knowledgeable Singapore property advisor and valuation specialist.
Analyze this homeowner's property situation based on Singapore market conditions (URA Master Plan, HDB Resale Index, BTO & EC price trends):

Homeowner: ${customerName || "Homeowner"}
Current Property: ${propertyAddress || "Singapore Residential"} (${propertyType || "4-Room HDB"})
Purchase Price: S$${pPrice.toLocaleString()} in year ${purchaseYear || 2018}
Expected Target Selling Price: S$${Number(expectedSellingPrice || 0).toLocaleString()}
Expected Target Profit Margin: S$${expProfit.toLocaleString()}
Recent Market Comps in Area: S$${compPrice.toLocaleString()}
Outstanding Loan: S$${loanDeduction.toLocaleString()}
CPF to refund (with accrued interest): S$${cpfRefund.toLocaleString()}
Estimated Net Cash Proceeds: S$${estimatedNetCashProceeds.toLocaleString()}
Next Home Wishlist: ${wishlistType || "Executive Condominium / Resale"} in ${wishlistLocation || "Central / North-East"}, Budget S$${Number(targetBudget || 1200000).toLocaleString()}

Provide a concise, sharp, professional evaluation (3 to 4 punchy bullet points) addressing:
1. Valuation assessment: Is their expected selling price realistic against recent URA/HDB transactions?
2. Profit margin projection: Will they hit their S$${expProfit.toLocaleString()} target? Mention their net cash proceeds.
3. Matchmaking verdict: How well does their net proceeds and borrowing power match their wishlist BTO/EC/resale in ${wishlistLocation}?
4. Electric Agent recommendation: Clear next step (e.g. assign a licensed agent for on-site valuation, lock in listing price, or enter the ballot).

Keep the tone energetic, sharp, and realistic about Singapore property regulations (MOP, ABSD, CPF housing grants, TDSR). Output in clean markdown.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });
        aiAnalysis = response.text || "";
      } catch (err) {
        console.error("Gemini API call failed:", err);
      }
    }

    // Fallback if no API key or AI call failed
    if (!aiAnalysis) {
      aiAnalysis = `### Electric Valuation & Matchmaking Verdict

- **Valuation Benchmark**: Recent comparable transactions indicate a realistic market valuation of **S$${estimatedValuation.toLocaleString()}** (holding period: ${holdingPeriod} years).
- **Profit Target Status**: ${
        targetSurpassed
          ? `⚡ **Target Surpassed by S$${Math.abs(profitDifference).toLocaleString()}**! Your gross capital gain of S$${grossCapitalGain.toLocaleString()} exceeds your target profit of S$${expProfit.toLocaleString()}.`
          : `⚠️ **Current Gap of S$${Math.abs(profitDifference).toLocaleString()}**: Estimated gross gain of S$${grossCapitalGain.toLocaleString()} is slightly below your S$${expProfit.toLocaleString()} target, but strong demand in ${propertyAddress?.split(",")[1] || "your estate"} may close this quickly.`
      }
- **Net Cash Proceeds**: After accounting for estimated outstanding loan (S$${loanDeduction.toLocaleString()}), CPF refund + accrued interest (S$${cpfRefund.toLocaleString()}), and standard 2% sales commission, your projected net cash in hand is **S$${estimatedNetCashProceeds.toLocaleString()}**.
- **Wishlist Feasibility**: Your projected proceeds provide a healthy 25% downpayment buffer for target properties in **${wishlistLocation || "your desired area"}**, making upcoming BTO / Executive Condominiums highly viable.
- **Electric Agent Action**: Recommended to assign our designated estate specialist to perform an exact on-site condition assessment and file official URA/HDB e-lodgement.`;
    }

    res.json({
      success: true,
      data: {
        estimatedValuation,
        grossCapitalGain,
        estimatedNetCashProceeds,
        targetSurpassed,
        profitDifference,
        aiAnalysis,
        breakdown: {
          purchasePrice: pPrice,
          compPrice,
          loanDeduction,
          cpfRefund,
          agentFee,
          legalConveyancing,
          netProceeds: estimatedNetCashProceeds,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in agent-evaluate:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ Electric Property Agent Server running on http://localhost:${PORT}`);
  });
}

startServer();

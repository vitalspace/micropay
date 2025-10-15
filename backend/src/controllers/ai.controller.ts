import { Context } from "elysia";
import Cerebras from "@cerebras/cerebras_cloud_sdk";

export const analyzeService = async (ctx: Context) => {
  try {
    const { services } = ctx.body as {
      services: {
        name: string;
        description: string;
        service_type: string;
        amount: string;
        total_raised: string;
        supporter_count: number;
        is_active: boolean;
        amountFormatted?: string;
        totalRaisedFormatted?: string;
      }[];
    };

    if (!services || !Array.isArray(services) || services.length === 0) {
      ctx.set.status = 400;
      return {
        message: "Missing or invalid services data",
      };
    }

    const cerebras = new Cerebras({
      apiKey: process.env["CEREBRAS_API_KEY"],
    });

    const serviceTypeLabels = {
      Donation: "donation campaign",
      Service: "service offering",
      Product: "product sale"
    };

    const servicesData = services.map((service, index) => ({
      serviceNumber: index + 1,
      name: service.name,
      description: service.description,
      type: service.service_type,
      goalAmount: service.amountFormatted,
      raisedAmount: service.totalRaisedFormatted,
      supporters: service.supporter_count,
      isActive: service.is_active
    }));

    const formattedServices = services.map(service => ({
      ...service,
      amountFormatted: service.amountFormatted || (parseFloat(service.amount || '0') / 1e18).toFixed(2) + ' STRK',
      totalRaisedFormatted: service.totalRaisedFormatted || (parseFloat(service.total_raised || '0') / 1e18).toFixed(2) + ' STRK'
    }));

    const totalRaised = (formattedServices.reduce((sum, s) => sum + parseFloat(s.total_raised || '0') / 1e18, 0)).toFixed(2);
    const activeCount = formattedServices.filter(s => s.is_active).length;
    const portfolioOverview = `Your portfolio contains ${formattedServices.length} ${formattedServices.length === 1 ? 'service' : 'services'}. ${activeCount} ${activeCount === 1 ? 'is' : 'are'} currently active, with a total of ${totalRaised} STRK raised across all services.`;

    const serviceCards = formattedServices.map(service => `
    <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div class="flex justify-between items-start mb-4">
        <h3 class="font-semibold text-gray-900 text-lg">${service.name}</h3>
        <span class="px-3 py-1 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 rounded-full text-xs font-medium uppercase shadow-sm">${service.service_type}</span>
      </div>

      <p class="text-gray-600 text-sm mb-4 leading-relaxed">${service.description}</p>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-gray-50/50 rounded-2xl p-3">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Goal</div>
          <div class="font-bold text-gray-900 text-lg">${service.amountFormatted}</div>
        </div>
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3">
          <div class="text-xs text-amber-600 uppercase tracking-wide">Raised</div>
          <div class="font-bold text-amber-700 text-lg">${service.totalRaisedFormatted}</div>
        </div>
      </div>

      <div class="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100/50">
        <span class="flex items-center gap-2">
          <span class="text-lg">👥</span>
          ${service.supporter_count} supporter${service.supporter_count !== 1 ? 's' : ''}
        </span>
        <span class="flex items-center gap-2 ${service.is_active ? 'text-green-600' : 'text-gray-400'}">
          <span class="w-2 h-2 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-gray-400'}"></span>
          ${service.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>`).join('');

    const stream = await cerebras.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Analyze the provided services data in JSON format and provide insights and recommendations. All amounts are already formatted as currency strings (e.g., "0.01 STRK"). Use these formatted values directly in your analysis. Return ONLY a JSON object with this exact structure:
{
 "insights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
 "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4", "recommendation 5"]
}
Each array should have exactly 5 items. Focus on actionable insights based on the service data provided.`,
        },
        {
          role: "user",
          content: JSON.stringify(servicesData),
        },
      ],
      model: "gpt-oss-120b",
      stream: true,
      max_completion_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      reasoning_effort: "medium",
    });

    let aiResponse = "";
    for await (const chunk of stream) {
      aiResponse += (chunk as any).choices[0]?.delta?.content || "";
    }

    let aiData;
    try {
      aiData = JSON.parse(aiResponse);
    } catch (e) {
      aiData = {
        insights: [
          "Portfolio analysis completed",
          "Services data processed",
          "Funding metrics calculated",
          "Activity status reviewed",
          "Performance insights generated"
        ],
        recommendations: [
          "Review service descriptions for clarity",
          "Monitor funding progress regularly",
          "Engage with supporters actively",
          "Consider service reactivation strategies",
          "Optimize portfolio based on performance data"
        ]
      };
    }

    const insightsHtml = aiData.insights.map((insight: string, idx: number) => `
      <div class="flex gap-3 items-start p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100/50">
        <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">${idx + 1}</span>
        <p class="text-gray-700 text-sm leading-relaxed flex-1">${insight}</p>
      </div>`).join('');

    const recommendationsHtml = aiData.recommendations.map((rec: string, idx: number) => `
      <div class="flex gap-3 items-start p-3 bg-gradient-to-r from-green-50 to-green-100/50 rounded-2xl border border-green-100/50">
        <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">${idx + 1}</span>
        <p class="text-gray-700 text-sm leading-relaxed flex-1">${rec}</p>
      </div>`).join('');

    const analysis = `
<div class="space-y-6">

  <div class="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-lg">
    <h3 class="font-bold text-lg mb-3">Portfolio Overview</h3>
    <p class="text-white/95 text-sm leading-relaxed">${portfolioOverview}</p>
  </div>

  <div class="grid md:grid-cols-2 gap-6">
    ${serviceCards}
  </div>

  <div class="grid md:grid-cols-2 gap-6">

    <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-2xl shadow-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <h3 class="font-bold text-gray-900 text-lg">Key Insights</h3>
      </div>
      <div class="space-y-3">
        ${insightsHtml}
      </div>
    </div>

    <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-2xl shadow-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
        <h3 class="font-bold text-gray-900 text-lg">Recommendations</h3>
      </div>
      <div class="space-y-3">
        ${recommendationsHtml}
      </div>
    </div>

  </div>

</div>`;

    return { analysis };
  } catch (error) {
    ctx.set.status = 500;
    return { message: "Internal server error", error };
  }
};

export const improveService = async (ctx: Context) => {
  try {
    const { field, context, currentValue } = ctx.body as {
      field: "name" | "description";
      context: string;
      currentValue: string;
    };

    if (!field || !context || !currentValue) {
      ctx.set.status = 400;
      return {
        message: "Missing required fields: field, context, currentValue",
      };
    }

    if (!["name", "description"].includes(field)) {
      ctx.set.status = 400;
      return { message: "Invalid field. Must be 'name' or 'description'" };
    }

    const cerebras = new Cerebras({
      apiKey: process.env["CEREBRAS_API_KEY"],
    });

    const maxLength = field === "name" ? 100 : 256;

    const stream = await cerebras.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Improve the following ${field} for a campaign using the provided context. The improved ${field} must be at most ${maxLength} characters long. Only output the improved ${field}, nothing else.`,
        },
        {
          role: "user",
          content: `Current ${field}: ${currentValue}\nContext: ${context}`,
        },
      ],
      model: "gpt-oss-120b",
      stream: true,
      max_completion_tokens: 65536,
      temperature: 1,
      top_p: 1,
      reasoning_effort: "medium",
    });

    let improvedText = "";
    for await (const chunk of stream) {
      improvedText += (chunk as any).choices[0]?.delta?.content || "";
    }

    return { improvedText };
  } catch (error) {
    ctx.set.status = 500;
    return { message: "Internal server error", error };
  }
};

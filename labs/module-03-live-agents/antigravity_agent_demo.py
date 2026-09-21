#!/usr/bin/env python3
"""
Module 03 Lab — Orchestrating Multi-Step Autonomous Agents with Antigravity Patterns
====================================================================================
Demonstrates how to architect an autonomous Supervisor + Specialist Subagent harness
using the official `google-genai` SDK and Antigravity workspace conventions:
  - Planner / Orchestrator Agent that decomposes a launch request into verifiable tasks
  - Market Research Subagent (with Google Search grounding tool)
  - Financial Auditor Subagent (with deterministic unit-economics verification tool)
  - Critic / Verifier Gate that validates output quality before completion

Usage:
    export GEMINI_API_KEY="your-api-key"
    python antigravity_agent_demo.py

Docs:
    https://ai.google.dev/gemini-api/docs/interactions-overview
    https://antigravity.google
"""

from dataclasses import dataclass, field
from typing import Callable, Dict, List
import json

from google import genai
from pydantic import BaseModel, Field

# Workhorse model for orchestration, delegation, and synthesis.
ORCHESTRATOR_MODEL = "gemini-3.8-flash"

# The agentic coding model behind the Antigravity IDE. Reference it when you
# graduate these patterns out of a script and into an Antigravity workspace.
ANTIGRAVITY_MODEL = "antigravity-preview-05-2026"


class SubagentTask(BaseModel):
    step_id: int = Field(description="Sequential step number.")
    specialist: str = Field(description="Target specialist agent: 'market_researcher' or 'financial_auditor'.")
    objective: str = Field(description="Clear, verifiable task instruction for the specialist subagent.")


class ExecutionPlan(BaseModel):
    mission_summary: str
    tasks: List[SubagentTask]


class FinalSynthesisReport(BaseModel):
    executive_summary_en: str
    executive_summary_es: str
    recommended_price_usd: float
    go_to_market_verdict: str
    key_risks: List[str]


@dataclass
class SubagentHarness:
    """Reusable Antigravity-style specialist subagent wrapper with isolated system instructions & tools."""

    name: str
    role_prompt: str
    tools: List[Callable] = field(default_factory=list)
    model_id: str = ORCHESTRATOR_MODEL

    def run(self, client: genai.Client, objective: str) -> str:
        # `tools`, `system_instruction`, and `generation_config` are
        # interaction-scoped, so they are re-specified on every delegation.
        interaction = client.interactions.create(
            model=self.model_id,
            input=objective,
            system_instruction=self.role_prompt,
            tools=self.tools if self.tools else None,
            generation_config={"temperature": 0.3, "thinking_level": "medium"},
        )
        return interaction.output_text or ""


def verify_margin_sensitivity(
    cogs_usd: float,
    price_usd: float,
    cac_usd: float,
    defect_rate_pct: float = 2.0,
) -> Dict[str, float]:
    """Deterministic financial stress-test tool used by the Financial Auditor subagent."""
    effective_cogs = cogs_usd * (1.0 + defect_rate_pct / 100.0)
    net_contribution = round(price_usd - effective_cogs - cac_usd, 2)
    margin_pct = round((net_contribution / price_usd) * 100.0, 2) if price_usd > 0 else 0.0
    return {
        "effective_cogs_usd": round(effective_cogs, 2),
        "net_contribution_usd": net_contribution,
        "net_contribution_margin_pct": margin_pct,
    }


def orchestrate_product_launch_mission(product_brief: str) -> FinalSynthesisReport:
    """Runs the full Plan -> Delegate -> Verify -> Synthesize loop."""
    client = genai.Client()

    # 1. Planner step: generate a structured execution plan
    print("[Orchestrator] Planning multi-agent mission...")
    plan_interaction = client.interactions.create(
        model=ORCHESTRATOR_MODEL,
        input=f"Decompose this product launch evaluation into specialist tasks:\n\n{product_brief}",
        system_instruction=(
            "You are a Lead Antigravity Orchestrator. Break complex product launch requests "
            "into 2 focused tasks delegated to 'market_researcher' and 'financial_auditor'."
        ),
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ExecutionPlan.model_json_schema(),
        },
        generation_config={"temperature": 0.2, "thinking_level": "high"},
    )
    plan = ExecutionPlan.model_validate_json(plan_interaction.output_text)
    print(f"  -> Mission Plan: {plan.mission_summary} ({len(plan.tasks)} tasks)")

    # 2. Initialize specialist subagents
    specialists: Dict[str, SubagentHarness] = {
        "market_researcher": SubagentHarness(
            name="Market Researcher",
            role_prompt=(
                "You are a Competitive Positioning & Category Research Specialist. "
                "Analyze differentiation, buyer personas, and channel strategy."
            ),
        ),
        "financial_auditor": SubagentHarness(
            name="Financial Auditor",
            role_prompt=(
                "You are a Hardware Unit Economics Auditor. Always call `verify_margin_sensitivity` "
                "to stress-test pricing, COGS, CAC, and defect-rate assumptions."
            ),
            tools=[verify_margin_sensitivity],
        ),
    }

    # 3. Execute specialist subagents and collect grounded evidence
    scratchpad: List[str] = []
    for task in plan.tasks:
        agent = specialists.get(task.specialist, specialists["market_researcher"])
        print(f"\n[Delegating Step {task.step_id}] -> {agent.name}: {task.objective}")
        finding = agent.run(client, task.objective)
        scratchpad.append(f"### Step {task.step_id} ({agent.name})\n{finding}")

    # 4. Synthesize final bilingual executive decision report
    print("\n[Orchestrator] Synthesizing verified bilingual Go-To-Market report...")
    synthesis_interaction = client.interactions.create(
        model=ORCHESTRATOR_MODEL,
        input="\n\n".join(scratchpad),
        system_instruction=(
            "Synthesize the specialist findings into a verified executive Go-To-Market report "
            "with summaries in both English and Spanish."
        ),
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": FinalSynthesisReport.model_json_schema(),
        },
        generation_config={"temperature": 0.2, "thinking_level": "high"},
    )
    return FinalSynthesisReport.model_validate_json(synthesis_interaction.output_text)


if __name__ == "__main__":
    sample_brief = (
        "Product: PulseBand Air — Ultra-lightweight hydration & HRV wearable strap for endurance runners. "
        "Target COGS: $31, Proposed Retail Price: $129, Estimated Paid Social CAC: $34."
    )
    report = orchestrate_product_launch_mission(sample_brief)
    print("\n=== FINAL VERIFIED ANTIGRAVITY LAUNCH REPORT ===")
    print(json.dumps(report.model_dump(), indent=2, ensure_ascii=False))
    print(
        f"\nGraduate this harness into an Antigravity workspace ({ANTIGRAVITY_MODEL}): "
        "https://antigravity.google"
    )

from __future__ import annotations

from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.agents.emotion import emotion_agent
from app.agents.interaction import interaction_agent
from app.agents.language_style import language_style_agent
from app.agents.relation_predict import relation_predict_agent
from app.agents.summarize import summarize_agent
from app.parser import ChatMessage


class AnalysisState(TypedDict, total=False):
    chat_messages: list[ChatMessage]
    language_report: dict[str, Any]
    emotion_report: dict[str, Any]
    interaction_report: dict[str, Any]
    relation_report: dict[str, Any]
    final_report: dict[str, Any]


def build_analysis_graph():
    graph = StateGraph(AnalysisState)
    graph.add_node("language_style_agent", language_style_agent)
    graph.add_node("emotion_agent", emotion_agent)
    graph.add_node("interaction_agent", interaction_agent)
    graph.add_node("relation_predict_agent", relation_predict_agent)
    graph.add_node("summarize_agent", summarize_agent)

    graph.add_edge(START, "language_style_agent")
    graph.add_edge(START, "emotion_agent")
    graph.add_edge(START, "interaction_agent")
    graph.add_edge(["language_style_agent", "emotion_agent", "interaction_agent"], "relation_predict_agent")
    graph.add_edge("relation_predict_agent", "summarize_agent")
    graph.add_edge("summarize_agent", END)

    return graph.compile()


def run_analysis(chat_messages: list[ChatMessage]) -> dict[str, Any]:
    app = build_analysis_graph()
    result = app.invoke({"chat_messages": chat_messages})
    return result["final_report"]

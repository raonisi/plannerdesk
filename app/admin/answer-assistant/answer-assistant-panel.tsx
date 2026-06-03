import { AnswerAssistantPanelShell } from "@/components/answer-assistant/answer-assistant-panel";
import { generateAnswerAssistantDraftAction } from "./actions";

export function AnswerAssistantPanel() {
  return (
    <AnswerAssistantPanelShell
      generationEnabled
      submitAction={generateAnswerAssistantDraftAction}
      variant="admin"
    />
  );
}

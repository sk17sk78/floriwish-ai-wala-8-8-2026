// icons
import { CirclePlus, PenLine } from "lucide-react";

// hooks
import { useState } from "react";

// types
import { type ChangeEvent } from "react";

export default function CartItemInstruction({
  instruction,
  onChangeInstruction
}: {
  instruction?: string;
  onChangeInstruction: (instruction: string) => void;
}) {
  // states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localInstruction, setLocalInstruction] = useState<string>(
    instruction || ""
  );

  // event handlers
  const handleSave = () => {
    onChangeInstruction(localInstruction);
    setIsEditing(false);
  };

  const presetTexts = [
    "Congratulations!",
    "Welcome",
    "Happy Birthday",
    "Warm Anniversary"
  ];

  return (
    <div className="border-t border-charcoal-3/10 bg-ivory-1/30 px-4 py-3 sm:px-5">
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full border border-charcoal-3/10">
              <PenLine width={14} height={14} className="text-charcoal-3/60" />
            </div>
            <textarea
              name="instruction"
              title="instruction"
              value={localInstruction}
              onChange={({
                target: { value: instruction }
              }: ChangeEvent<HTMLTextAreaElement>) => {
                setLocalInstruction(instruction);
              }}
              autoFocus
              className="flex-1 resize-none bg-white border border-charcoal-3/10 rounded-xl outline-none p-3 min-h-[80px] text-sm text-charcoal-3 shadow-inner placeholder-charcoal-3/30"
              placeholder="Add delivery Instruction"
            />
            <button
              onClick={handleSave}
              className="bg-sienna-1 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:brightness-110 transition-all self-end mb-1"
            >
              Save
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {presetTexts.map((text, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalInstruction(text);
                }}
                className="text-[11px] px-3 py-1.5 rounded-full border border-charcoal-3/10 bg-white hover:bg-charcoal-3/5 transition-all text-charcoal-3/60"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <PenLine width={14} height={14} className="text-charcoal-3/40 group-hover:text-sienna-1 transition-colors flex-shrink-0" />
            <span className="text-sm text-charcoal-3/50 group-hover:text-charcoal-3/80 transition-colors truncate">
              {instruction || "Add delivery Instruction"}
            </span>
          </div>
          {instruction && (
            <span className="text-xs font-bold text-sienna-1 hover:underline ml-2">Edit</span>
          )}
        </div>
      )}
    </div>
  );
}

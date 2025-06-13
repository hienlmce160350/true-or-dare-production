import React, { useState, useEffect } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import { LuCopy, LuCopyCheck } from "react-icons/lu";
import { cn } from "@/utils/cn";

type CopyButtonProps = {
  textToCopy: string;
  iconSize?: number;
  onCopied?: () => void;
  buttonType?: "icon" | "button";
  className?: string;
};

export default function CopyButton({
  textToCopy,
  iconSize = 16,
  onCopied,
  buttonType = "icon",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onCopied?.();
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [copied]);

  return buttonType === "icon" ? (
    <Tooltip title={copied ? "Đã sao chép" : "Sao chép"} arrow>
      <IconButton
        onClick={copyToClipboard}
        className={cn(
          "transition-all duration-300 hover:bg-opacity-80",
          className
        )}
        size="small"
      >
        {copied ? <LuCopyCheck size={iconSize} /> : <LuCopy size={iconSize} />}
      </IconButton>
    </Tooltip>
  ) : (
    <Button
      variant="outlined"
      startIcon={
        copied ? <LuCopyCheck size={iconSize} /> : <LuCopy size={iconSize} />
      }
      onClick={copyToClipboard}
      className={className}
    >
      {copied ? "Đã sao chép" : "Sao chép"}
    </Button>
  );
}

"use client";

import {
  closeSnackbar,
  SnackbarProvider as NotistackProvider,
} from "notistack";
import { useRef } from "react";

import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";

import Iconify from "../iconify";
import { StyledIcon, StyledNotistack } from "./styles";
import { useSettingThemeValuesContext } from "../settings/context/settings-context";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function SnackbarProvider({ children }: Props) {
  const themeSettings = useSettingThemeValuesContext();

  const isRTL = themeSettings.themeDirection === "rtl";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notistackRef = useRef<any>(null);

  return (
    <NotistackProvider
      ref={notistackRef}
      maxSnack={5}
      preventDuplicate
      autoHideDuration={3000}
      TransitionComponent={isRTL ? Collapse : undefined}
      variant="success" // Set default variant
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      style={{ flexWrap: "nowrap" }}
      iconVariant={{
        info: (
          <StyledIcon color="info" className="flex-none">
            <Iconify icon="eva:info-fill" width={24} />
          </StyledIcon>
        ),
        success: (
          <StyledIcon color="success" className="flex-none">
            <Iconify icon="eva:checkmark-circle-2-fill" width={24} />
          </StyledIcon>
        ),
        warning: (
          <StyledIcon color="warning" className="flex-none">
            <Iconify icon="eva:alert-triangle-fill" width={24} />
          </StyledIcon>
        ),
        error: (
          <StyledIcon color="error" className="flex-none">
            <Iconify icon="solar:danger-bold" width={24} />
          </StyledIcon>
        ),
      }}
      Components={{
        default: StyledNotistack,
        info: StyledNotistack,
        success: StyledNotistack,
        warning: StyledNotistack,
        error: StyledNotistack,
      }}
      // with close as default
      action={(snackbarId) => (
        <IconButton
          size="small"
          onClick={() => closeSnackbar(snackbarId)}
          sx={{ p: 0.5 }}
        >
          <Iconify width={16} icon="mingcute:close-line" />
        </IconButton>
      )}
    >
      {children}
    </NotistackProvider>
  );
}

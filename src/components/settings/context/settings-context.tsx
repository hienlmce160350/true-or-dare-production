/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { createContext, useContext } from "react";

import {
  SettingActionsProps,
  SettingsContextProps,
  SettingsThemeValueProps,
} from "../types";

// ----------------------------------------------------------------------

export const SettingsContext = createContext({} as SettingsContextProps);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);

  if (!context)
    throw new Error("useSettingsContext must be use inside SettingsProvider");

  return context;
};

export const SettingThemeValuesContext = createContext(
  {} as SettingsThemeValueProps
);

export const useSettingThemeValuesContext = () => {
  const context = useContext(SettingThemeValuesContext);

  if (!context)
    throw new Error(
      "useSettingThemeValuesContext must be use inside SettingsProvider"
    );

  return context;
};

export const SettingActionsContext = createContext({
  onUpdate: (name: string, updateValue: unknown) => {},
  onChangeDirectionByLang: (lang: string) => {},
  onReset: () => {},
  onToggle: () => {},
  onClose: () => {},
} as SettingActionsProps);

export const useSettingActionsContext = () => {
  const context = useContext(SettingActionsContext);

  if (!context)
    throw new Error(
      "useSettingActionsContext must be use inside SettingsProvider"
    );

  return context;
};

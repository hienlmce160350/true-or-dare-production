// ----------------------------------------------------------------------

export type SettingsThemeValueProps = {
  themeStretch: boolean;
  themeMode: 'light' | 'dark';
  themeDirection: 'rtl' | 'ltr';
  themeContrast: 'default' | 'bold';
  themeLayout: 'vertical' | 'horizontal' | 'mini';
  themeColorPresets: 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red' | 'custom';
  themeCustomColor: string;
  themeFontFamily: string;
};

export type SettingActionsProps = {
  // Update
  onUpdate: (name: string, value: string | boolean) => void;
  // Direction by lang
  onChangeDirectionByLang: (lang: string) => void;
  // Reset
  onReset: VoidFunction;
  // Drawer
  onToggle: VoidFunction;
  onClose: VoidFunction;
};

export type SettingCommonValues = {
  // Reset
  canReset: boolean;
  // Drawer
  open: boolean;
};

export type SettingsContextProps = SettingsThemeValueProps &
  SettingCommonValues &
  SettingActionsProps;

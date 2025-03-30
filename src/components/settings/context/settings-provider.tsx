'use client';

import isEqual from 'lodash/isEqual';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { SettingsThemeValueProps } from '../types';
import {
  SettingActionsContext,
  SettingThemeValuesContext,
  SettingsContext,
} from './settings-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { localStorageGetItem } from '@/utils/storage-available';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'settings';

type SettingsProviderProps = {
  children: React.ReactNode;
  defaultSettings: SettingsThemeValueProps;
};

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, defaultSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  const isArabic = localStorageGetItem('i18nextLng') === 'ar';

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang('ar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic]);

  // Direction by lang
  const onChangeDirectionByLang = useCallback(
    (lang: string) => {
      update('themeDirection', lang === 'ar' ? 'rtl' : 'ltr');
    },
    [update]
  );

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const fullSettingsAndActions = useMemo(
    () => ({
      ...state,
      onUpdate: update,
      // Direction
      onChangeDirectionByLang,
      // Reset
      canReset,
      onReset: reset,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [
      reset,
      update,
      state,
      canReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      onChangeDirectionByLang,
    ]
  );

  const themeSettingValues: SettingsThemeValueProps = useMemo(() => ({ ...state }), [state]);

  const settingActions = useMemo(
    () => ({
      onUpdate: update,
      // Direction
      onChangeDirectionByLang,
      // Reset
      onReset: reset,
      // Drawer
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [onChangeDirectionByLang, onCloseDrawer, onToggleDrawer, reset, update]
  );

  return (
    <SettingsContext.Provider value={fullSettingsAndActions}>
      <SettingThemeValuesContext.Provider value={themeSettingValues}>
        <SettingActionsContext.Provider value={settingActions}>
          {children}
        </SettingActionsContext.Provider>
      </SettingThemeValuesContext.Provider>
    </SettingsContext.Provider>
  );
}

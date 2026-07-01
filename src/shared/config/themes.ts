const lightPalette = {
    // Бренд
    primary: "#108A43",
    primaryLight: "#E8F5E9",
    onPrimary: "#FFFFFF",
  
    // Семантика
    error: "#EB5757",
    errorLight: "#FDEEEE",
    warning: "#F2994A",
    warningLight: "#FEF3E8",
    success: "#108A43",
    info: "#2196F3",
    infoLight: "#E3F2FD",
  
    // Текст
    textPrimary: "#1A1A1A",
    textSecondary: "#757575",
    textDisabled: "#BDBDBD",
  
    // Фоны
    background: "#FFFFFF",
    surface: "#F5F5F5",
    surfaceMuted: "#FAFAFA",
  
    // Границы
    border: "#E0E0E0",
    divider: "#EEEEEE",
    separator: "#D6D6D6",
  
    // Навигация
    tabActive: "#108A43",
    tabInactive: "#9E9E9E",
  
    // Бейдж
    badge: "#EB5757",
    onBadge: "#FFFFFF",
  } as const;

export const lightTheme = {
    color: lightPalette,
    offset: {
        content: 16,
        line: 12,
        sectionVertical: 32,
        itemVertical: 16,
        itemHorizontal: 8,
        block: 24,
        itemBetween: 24,
        modalTop: 73,
        tiny: 4,
    },
} as const;
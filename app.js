    const STORAGE_KEY = "caderneta_mundial_2026_estado_v1";
    const USER_COLOR_KEY = "caderneta_mundial_2026_user_color";
    const PROFILE_PHOTO_KEY = "caderneta_mundial_2026_profile_photo";
    const COUNTRY_SORT_KEY = "caderneta_mundial_2026_country_sort";
    const DEFAULT_USER_COLOR = "#111827";
    const DEFAULT_THEME_COLOR = DEFAULT_USER_COLOR;
    const USER_COLOR_PALETTE = [
      "#111827", "#7f1d1d", "#dc2626", "#ea580c", "#f59e0b",
      "#eab308", "#84cc16", "#16a34a", "#059669", "#0d9488",
      "#0891b2", "#0284c7", "#1d4ed8", "#312e81", "#7c3aed",
      "#a21caf", "#db2777", "#be123c", "#92400e", "#4b5563"
    ];
    const APP_THEME_KEY = "caderneta_mundial_2026_app_theme";
    const COLLECTION_MODE_KEY = "caderneta_mundial_2026_collection_mode";
    const HISTORY_KEY = "caderneta_mundial_2026_history";
    const APP_THEMES = {
      light: [
        { id: "default", name: "Light default", accent: "#111827", countryMode: "normal", bg: "#f3f7fb", card: "#ffffff", panel: "#f8fafc", text: "#0f172a", muted: "#475569", line: "#dbeafe", header: "rgba(255,255,255,.94)" },
        { id: "windows", name: "Windows azul", accent: "#0078d4", countryMode: "theme", bg: "#eef7ff", card: "#ffffff", panel: "#f7fbff", text: "#102033", muted: "#526579", line: "#b9ddff", header: "rgba(255,255,255,.94)" },
        { id: "mint", name: "Menta", accent: "#00866d", countryMode: "theme", bg: "#edf8f4", card: "#ffffff", panel: "#f6fbf8", text: "#10231f", muted: "#4b625b", line: "#b9e4d6", header: "rgba(255,255,255,.94)" },
        { id: "rose", name: "Rosa suave", accent: "#b4235a", countryMode: "theme", bg: "#fff3f7", card: "#ffffff", panel: "#fff8fb", text: "#26151c", muted: "#654a55", line: "#f5c6d6", header: "rgba(255,255,255,.94)" }
      ],
      dark: [
        { id: "default", name: "Dark default", accent: "#60a5fa", countryMode: "normal", bg: "#0f1117", card: "#171a21", panel: "#1f2430", text: "#f8fafc", muted: "#b8c2d1", line: "#303744", header: "rgba(17,20,28,.94)" },
        { id: "windows", name: "Windows dark", accent: "#0078d4", countryMode: "theme", bg: "#0f0f10", card: "#1b1b1d", panel: "#242426", text: "#f5f5f5", muted: "#c7c7c7", line: "#3a3a3c", header: "rgba(31,31,33,.94)" },
        { id: "graphite", name: "Grafite verde", accent: "#2dd4bf", countryMode: "theme", bg: "#0b1010", card: "#151c1c", panel: "#1c2828", text: "#f0fdfa", muted: "#b7c9c7", line: "#2b3d3d", header: "rgba(21,28,28,.94)" },
        { id: "violet", name: "Noite violeta", accent: "#8b5cf6", countryMode: "theme", bg: "#100f16", card: "#1b1824", panel: "#252033", text: "#faf5ff", muted: "#cdc4d9", line: "#382f4c", header: "rgba(27,24,36,.94)" },
        { id: "wine", name: "Carvao vinho", accent: "#fb7185", countryMode: "theme", bg: "#120f12", card: "#1d181c", panel: "#2a2027", text: "#fff1f2", muted: "#d4bec5", line: "#44303a", header: "rgba(29,24,28,.94)" }
      ]
    };
    const LIVE_REFRESH_MS = 4000;
    const IDLE_LOGOUT_MS = 30 * 60 * 1000;
    const AUTH_REQUEST_TIMEOUT_MS = 30000;
    const STARTUP_REQUEST_TIMEOUT_MS = 8000;
    const STARTUP_RETRY_DELAY_MS = 2200;
    const STARTUP_MAX_ATTEMPTS = 45;
    const TRADE_HISTORY_PAGE_SIZE = 5;
    const TRADE_PICK_PAGE_SIZE = 50;
    const LIST_COMPARE_MODE_COPY = {
      duplicates: {
        resultTitle: "Cromos que essa pessoa tem repetidos e te faltam",
        emptyText: "Nao precisas de nenhum cromo dessa lista.",
        helpText: "Leste uma lista de repetidos de outra pessoa. A app cruza essa lista com os cromos que te faltam."
      },
      missing: {
        resultTitle: "Cromos que podes dar com os teus repetidos",
        emptyText: "Nao tens repetidos para ajudar essa lista.",
        helpText: "Leste uma lista de cromos em falta de outra pessoa. A app cruza essa lista com os teus repetidos."
      }
    };

    let stickers = [];
    let activePage = "album";
    let currentView = "all";
    let modalView = "all";
    let selectedCountry = "all";
    let countrySortMode = "album";
    let countryModalOpen = false;
    let countryModalDuplicateOnly = false;
    let saveTimer = null;
    const pendingStickerIds = new Set();
    let fullSyncPending = false;
    let persistInFlight = null;
    let countryScrollFrame = null;
    let countryTabsOffset = 0;
    let liveEnabled = false;
    let liveProfile = "";
    let liveUpdatedAt = "";
    let liveTradesUpdatedAt = "";
    let friendProfile = "";
    let friendStickers = [];
    let friendUpdatedAt = "";
    let tradeRequests = [];
    let liveHistoryLogs = [];
    let liveProfilesList = [];
    let liveProfilesLoadedAt = 0;
    const friendAlbumCache = new Map();
    const friendAlbumRequests = new Map();
    const FRIEND_CACHE_TTL_MS = 12_000;
    let friendLoadSequence = 0;
    let tradeOverviewRefreshTimer = null;
    let onlineProfilePhoto = "";
    let undoState = null;
    let undoTimer = null;
    let tradeHistoryPage = 1;
    let historyDayIndex = 0;
    let tradeModalOpen = false;
    let reserveModalOpen = false;
    let editingReservedTradeId = "";
    let mobileToolsModalOpen = false;
    let mobileToolsModalMode = "tools";
    let duplicateViewMode = "available";
    let duplicateGroupingMode = localStorage.getItem("caderneta_duplicate_grouping") === "flat" ? "flat" : "groups";
    let tradeDetailId = "";
    let selectedTradeGiveIds = [];
    let selectedTradeReceiveIds = [];
    let tradePickPages = { give: 1, receive: 1 };
    let tradeOverviewItems = [];
    let tradeOverviewLoading = false;
    let tradeOverviewLoadedAt = 0;
    let listCompareMode = "duplicates";
    let activeListTool = "compare";
    let modalTouchGesture = null;
    let liveRefreshTimer = null;
    let liveRefreshInFlight = false;
    let renderFrame = 0;
    let idleLogoutTimer = null;
    let authRequestLocked = false;
    let sessionExpiryHandled = false;
    let inviteToken = "";
    let inviteValid = false;
    let inviteFromCurrentLink = false;
    let pendingAppShortcut = "";
    let currentUserColor = DEFAULT_USER_COLOR;
    let friendUserColor = DEFAULT_USER_COLOR;
    let friendRankingItems = [];
    let availableUserColors = [...USER_COLOR_PALETTE];
    let usedUserColors = [];
    let profileColors = {};
    let profilePhotos = {};
    let appThemeMode = "dark";
    let appThemePresetId = "default";
    let collectionMode = localStorage.getItem(COLLECTION_MODE_KEY) || "all";
    let deferredInstallPrompt = null;

    const content = document.getElementById("content");
    const albumDashboard = document.getElementById("albumDashboard");
    const albumStats = document.getElementById("albumStats");
    const collectionProgress = document.getElementById("collectionProgress");
    const collectionProgressText = document.getElementById("collectionProgressText");
    const collectionProgressBar = document.getElementById("collectionProgressBar");
    const albumHomeTitle = document.getElementById("albumHomeTitle");
    const albumHomeTitleMain = document.getElementById("albumHomeTitleMain");
    const albumHomeTitleSub = document.getElementById("albumHomeTitleSub");
    const albumToolbar = document.getElementById("albumToolbar");
    const homeDashboard = document.getElementById("homeDashboard");
    const homeDashboardGrid = document.getElementById("homeDashboardGrid");
    const countryTabsWrap = document.getElementById("countryTabsWrap");
    const countryTabs = document.getElementById("countryTabs");
    const countrySortSelect = document.getElementById("countrySortSelect");
    const countryScrollLeft = document.getElementById("countryScrollLeft");
    const countryScrollRight = document.getElementById("countryScrollRight");
    const search = document.getElementById("search");
    const clearSearchButton = document.getElementById("clearSearchButton");
    const exportListButton = document.getElementById("exportListButton");
    const exportSummary = document.getElementById("exportSummary");
    const collectionModeSelect = document.getElementById("collectionModeSelect");
    const friendModeBanner = document.getElementById("friendModeBanner");
    const friendBannerName = document.getElementById("friendBannerName");
    const friendViewAvatar = document.getElementById("friendViewAvatar");
    const friendViewAllButton = document.getElementById("friendViewAllButton");
    const friendViewDuplicatesButton = document.getElementById("friendViewDuplicatesButton");
    const friendDuplicateCount = document.getElementById("friendDuplicateCount");
    const friendTradePrompt = document.getElementById("friendTradePrompt");
    const countryModal = document.getElementById("countryModal");
    const countryModalPanel = document.getElementById("countryModalPanel");
    const countryModalBody = document.getElementById("countryModalBody");
    const resultSummary = document.getElementById("resultSummary");
    const livePanel = document.getElementById("livePanel");
    const liveUsernameInput = document.getElementById("liveUsernameInput");
    const livePasswordInput = document.getElementById("livePasswordInput");
    const liveStatusText = document.getElementById("liveStatusText");
    const liveFriendSelect = document.getElementById("liveFriendSelect");
    const liveComparison = document.getElementById("liveComparison");
    const friendInsights = document.getElementById("friendInsights");
    const tradePanel = document.getElementById("tradePanel");
    const tradeFriendSelect = document.getElementById("tradeFriendSelect");
    const tradeSuggestions = document.getElementById("tradeSuggestions");
    const tradeOverview = document.getElementById("tradeOverview");
    const toolsPanel = document.getElementById("toolsPanel");
    const mobileBottomNav = document.getElementById("mobileBottomNav");
    const desktopNav = document.getElementById("desktopNav");
    const mobileTradeBadge = document.getElementById("mobileTradeBadge");
    const mobileNotificationBadge = document.getElementById("mobileNotificationBadge");
    const tradeList = document.getElementById("tradeList");
    const tradeModal = document.getElementById("tradeModal");
    const tradeModalBody = document.getElementById("tradeModalBody");
    const reserveModal = document.getElementById("reserveModal");
    const reserveModalBody = document.getElementById("reserveModalBody");
    const mobileToolsModal = document.getElementById("mobileToolsModal");
    const mobileToolsModalBody = document.getElementById("mobileToolsModalBody");
    const notificationsPanel = document.getElementById("notificationsPanel");
    const notificationsResult = document.getElementById("notificationsResult");
    const historyPanel = document.getElementById("historyPanel");
    const historyResult = document.getElementById("historyResult");
    const historySearchInput = document.getElementById("historySearchInput");
    const historyTypeSelect = document.getElementById("historyTypeSelect");
    const historySortSelect = document.getElementById("historySortSelect");
    const listComparePanel = document.getElementById("listComparePanel");
    const listCompareInput = document.getElementById("listCompareInput");
    const listCompareResult = document.getElementById("listCompareResult");
    const compareDuplicatesTab = document.getElementById("compareDuplicatesTab");
    const compareMissingTab = document.getElementById("compareMissingTab");
    const bulkAddPanel = document.getElementById("bulkAddPanel");
    const bulkAddInput = document.getElementById("bulkAddInput");
    const bulkAddResult = document.getElementById("bulkAddResult");
    const friendListPanel = document.getElementById("friendListPanel");
    const friendListUserSelect = document.getElementById("friendListUserSelect");
    const friendListInput = document.getElementById("friendListInput");
    const friendListResult = document.getElementById("friendListResult");
    const settingsPanel = document.getElementById("settingsPanel");
    const accountPanel = document.getElementById("accountPanel");
    const accountOverview = document.getElementById("accountOverview");
    const settingsBackupMessage = document.getElementById("settingsBackupMessage");
    const installAppButton = document.getElementById("installAppButton");
    const installHelpText = document.getElementById("installHelpText");
    const themeColorInput = document.getElementById("themeColorInput");
    const themeColorTextInput = document.getElementById("themeColorTextInput");
    const userColorPalette = document.getElementById("userColorPalette");
    const appThemePalette = document.getElementById("appThemePalette");
    const lightModeButton = document.getElementById("lightModeButton");
    const darkModeButton = document.getElementById("darkModeButton");
    const settingsThemeMessage = document.getElementById("settingsThemeMessage");
    const settingsAppearanceMessage = document.getElementById("settingsAppearanceMessage");
    const settingsCurrentPasswordInput = document.getElementById("settingsCurrentPasswordInput");
    const settingsNewPasswordInput = document.getElementById("settingsNewPasswordInput");
    const settingsConfirmPasswordInput = document.getElementById("settingsConfirmPasswordInput");
    const settingsPasswordMessage = document.getElementById("settingsPasswordMessage");
    const settingsChangePasswordButton = document.getElementById("settingsChangePasswordButton");
    const liveLogoutButton = document.getElementById("liveLogoutButton");
    const liveLoginButton = document.getElementById("liveLoginButton");
    const liveRegisterButton = document.getElementById("liveRegisterButton");
    const startupScreen = document.getElementById("startupScreen");
    const startupMessage = document.getElementById("startupMessage");
    const authGate = document.getElementById("authGate");
    const authLoginStatusText = document.getElementById("authLoginStatusText");
    const authRegisterStatusText = document.getElementById("authRegisterStatusText");
    const authLoginMessage = document.getElementById("authLoginMessage");
    const authRegisterMessage = document.getElementById("authRegisterMessage");
    const authLoginUsernameInput = document.getElementById("authLoginUsernameInput");
    const authLoginPasswordInput = document.getElementById("authLoginPasswordInput");
    const authRegisterUsernameInput = document.getElementById("authRegisterUsernameInput");
    const authRegisterPasswordInput = document.getElementById("authRegisterPasswordInput");
    const authPasswordUsernameInput = document.getElementById("authPasswordUsernameInput");
    const authCurrentPasswordInput = document.getElementById("authCurrentPasswordInput");
    const authNewPasswordInput = document.getElementById("authNewPasswordInput");
    const authConfirmPasswordInput = document.getElementById("authConfirmPasswordInput");
    const authPasswordMessage = document.getElementById("authPasswordMessage");
    const authChangePasswordButton = document.getElementById("authChangePasswordButton");
    const authLoginButton = document.getElementById("authLoginButton");
    const authCreateAccountButton = document.getElementById("authCreateAccountButton");
    const saveStatus = document.getElementById("saveStatus");

    const currentViewTitle = document.getElementById("currentViewTitle");
    const userMenu = document.getElementById("userMenu");
    const userMenuButton = document.getElementById("userMenuButton");
    const userMenuPanel = document.getElementById("userMenuPanel");
    const tradeMenuBadge = document.getElementById("tradeMenuBadge");
    const notificationMenuBadge = document.getElementById("notificationMenuBadge");
    const topNotificationButton = document.getElementById("topNotificationButton");
    const topNotificationBadge = document.getElementById("topNotificationBadge");
    const topNotificationsPopover = document.getElementById("topNotificationsPopover");
    const userMenuName = document.getElementById("userMenuName");
    const userMenuProfile = document.getElementById("userMenuProfile");
    const userMenuInitial = document.getElementById("userMenuInitial");
    const profilePhotoInput = document.getElementById("profilePhotoInput");
    const profilePhotoPreview = document.getElementById("profilePhotoPreview");
    const mobileUserAvatar = document.getElementById("mobileUserAvatar");
    const settingsProfilePhotoMessage = document.getElementById("settingsProfilePhotoMessage");

    const totalCount = document.getElementById("totalCount");
    const missingCount = document.getElementById("missingCount");
    const ownedCount = document.getElementById("ownedCount");
    const duplicatesCount = document.getElementById("duplicatesCount");

    const demoStickers = [
      { pais: "Portugal", codigo: "POR1", nome: "Cromo exemplo 1", tenho: false },
      { pais: "Portugal", codigo: "POR2", nome: "Cromo exemplo 2", tenho: true },
      { pais: "Brasil", codigo: "BRA1", nome: "Cromo exemplo 1", tenho: false },
      { pais: "Argentina", codigo: "ARG1", nome: "Cromo exemplo 1", tenho: false }
    ];

    const COUNTRY_COLORS = {
      FWC: "#111827",
      MEX: "#006747",
      RSA: "#00784B",
      KOR: "#FFFFFF",
      CZE: "#D8131A",
      CAN: "#D13622",
      BIH: "#002496",
      QAT: "#85374C",
      SUI: "#DA281C",
      BRA: "#009C3B",
      MAR: "#C3262F",
      HAI: "#01209F",
      SCO: "#005EB8",
      USA: "#E91939",
      PAR: "#D32B1E",
      AUS: "#0D1288",
      TUR: "#E30917",
      GER: "#000000",
      CUW: "#01239B",
      CIV: "#FD8000",
      ECU: "#FFCC00",
      NED: "#C6404E",
      JPN: "#FFFFFF",
      SWE: "#015293",
      TUN: "#E30917",
      BEL: "#101010",
      EGV: "#C7102E",
      IRN: "#239F3F",
      NZL: "#012269",
      ESP: "#CA3334",
      CPV: "#013892",
      KSA: "#0C7646",
      URU: "#FFFFFF",
      FRA: "#26377D",
      SEN: "#008540",
      IRQ: "#CE1125",
      NOR: "#B00005",
      ARG: "#75AADC",
      ALG: "#006636",
      AUT: "#C7102E",
      JOR: "#000000",
      POR: "#D93623",
      COD: "#017DF9",
      UZB: "#3190BB",
      COL: "#FFCD18",
      ENG: "#FFFFFF",
      CRO: "#FE0405",
      GHA: "#006B3F",
      PAN: "#FFFFFF"
    };

    const COUNTRY_SECONDARY_COLORS = {
      FWC: "#111827",
      MEX: "#CD1125",
      RSA: "#C7102E",
      KOR: "#C60C33",
      CZE: "#FFFFFF",
      CAN: "#D8E6ED",
      BIH: "#FFCB01",
      QAT: "#F0F0F0",
      SUI: "#DA281C",
      BRA: "#FFDF00",
      MAR: "#C3262F",
      HAI: "#D11234",
      SCO: "#FFFFFF",
      USA: "#FFFFFF",
      PAR: "#0038A7",
      AUS: "#EB060B",
      TUR: "#E30917",
      GER: "#DA0301",
      CUW: "#E8D901",
      CIV: "#039743",
      ECU: "#01468B",
      NED: "#2F65AD",
      JPN: "#FFFFFF",
      SWE: "#FFCB01",
      TUN: "#E30917",
      BEL: "#FCE406",
      EGV: "#000000",
      IRN: "#D80100",
      NZL: "#CC142B",
      ESP: "#F7D128",
      CPV: "#FFFFFF",
      KSA: "#0C7646",
      URU: "#0038A7",
      FRA: "#FFFFFF",
      SEN: "#FCEF41",
      IRQ: "#FFFFFF",
      NOR: "#00205B",
      ARG: "#FFFFFF",
      ALG: "#FFFFFF",
      AUT: "#E2614C",
      JOR: "#027A3D",
      POR: "#20774D",
      COD: "#CD1120",
      UZB: "#61A945",
      COL: "#DA0301",
      ENG: "#CD1225",
      CRO: "#FFFFFF",
      GHA: "#CE1127",
      PAN: "#D8131A"
    };



    const COUNTRY_TERTIARY_COLORS = {
      FWC: "#FFFFFF",
      MEX: "#FFFFFF",
      RSA: "#FFCB01",
      KOR: "#013378",
      CZE: "#124680",
      CAN: "#C55C44",
      BIH: "#4060AD",
      QAT: "#C86C89",
      SUI: "#FFFFFF",
      BRA: "#002776",
      MAR: "#01592F",
      HAI: "#CF6C67",
      SCO: "#005EB8",
      USA: "#0C276A",
      PAR: "#FFFFFF",
      AUS: "#FFFFFF",
      TUR: "#FFFFFF",
      GER: "#FECD18",
      CUW: "#533EA9",
      CIV: "#FDFDFD",
      ECU: "#FF1C2C",
      NED: "#F0F1F1",
      JPN: "#BB002D",
      SWE: "#015293",
      TUN: "#FFFFFF",
      BEL: "#E32D39",
      EGV: "#FFFFFF",
      IRN: "#FFFFFF",
      NZL: "#FFFFFF",
      ESP: "#E7604A",
      CPV: "#CD2026",
      KSA: "#FFFFFF",
      URU: "#FCD116",
      FRA: "#E42E3A",
      SEN: "#E11C23",
      IRQ: "#000000",
      NOR: "#FFFFFF",
      ARG: "#FCD116",
      ALG: "#D11234",
      AUT: "#FFFFFF",
      JOR: "#CE1126",
      POR: "#FFCC00",
      COD: "#F4CF1D",
      UZB: "#FBFCF9",
      COL: "#0B286C",
      ENG: "#FFFFFF",
      CRO: "#191897",
      GHA: "#FED116",
      PAN: "#0A2359"
    };

    const COUNTRY_PROGRESS_COLORS = {
      FWC: "#FFFFFF",
      MEX: "#FFFFFF",
      RSA: COUNTRY_TERTIARY_COLORS.RSA,
      SUI: "#FFFFFF",
      MAR: "#FFFFFF",
      TUR: "#FFFFFF",
      GER: "#FECD18",
      JPN: COUNTRY_TERTIARY_COLORS.JPN,
      TUN: "#FFFFFF",
      KSA: "#FFFFFF",
      AUT: "#FFFFFF",
      COD: COUNTRY_TERTIARY_COLORS.COD,
      POR: COUNTRY_TERTIARY_COLORS.POR,
      GHA: "#FED116",
      PAN: COUNTRY_TERTIARY_COLORS.PAN
    };
    const COUNTRY_NAMES = {
      FWC: "TROF\u00c9US INICIAIS",
      MEX: "M\u00c9XICO",
      RSA: "\u00c1FRICA DO SUL",
      KOR: "COREIA DO SUL",
      CZE: "TCH\u00c9QUIA",
      CAN: "CANAD\u00c1",
      BIH: "B\u00d3SNIA E HERZEGOVINA",
      QAT: "CATAR",
      SUI: "SUI\u00c7A",
      BRA: "BRASIL",
      MAR: "MARROCOS",
      HAI: "HAITI",
      SCO: "ESC\u00d3CIA",
      USA: "ESTADOS UNIDOS",
      PAR: "PARAGUAI",
      AUS: "AUSTR\u00c1LIA",
      TUR: "TURQUIA",
      GER: "ALEMANHA",
      CUW: "CURA\u00c7AO",
      CIV: "COSTA DO MARFIM",
      ECU: "EQUADOR",
      NED: "PA\u00cdSES BAIXOS",
      JPN: "JAP\u00c3O",
      SWE: "SU\u00c9CIA",
      TUN: "TUN\u00cdSIA",
      BEL: "B\u00c9LGICA",
      EGV: "EGITO",
      IRN: "IR\u00c3O",
      NZL: "NOVA ZEL\u00c2NDIA",
      ESP: "ESPANHA",
      CPV: "CABO VERDE",
      KSA: "AR\u00c1BIA SAUDITA",
      URU: "URUGUAI",
      FRA: "FRAN\u00c7A",
      SEN: "SENEGAL",
      IRQ: "IRAQUE",
      NOR: "NORUEGA",
      ARG: "ARGENTINA",
      ALG: "ARG\u00c9LIA",
      AUT: "\u00c1USTRIA",
      JOR: "JORD\u00c2NIA",
      POR: "PORTUGAL",
      COD: "REP. DEM. DO CONGO",
      UZB: "UZBEQUIST\u00c3O",
      COL: "COL\u00d4MBIA",
      ENG: "INGLATERRA",
      CRO: "CRO\u00c1CIA",
      GHA: "GANA",
      PAN: "PANAM\u00c1"
    };
    const OFFICIAL_WORLD_CUP_GROUPS = {
      "Grupo A": ["MEX", "RSA", "KOR", "CZE"],
      "Grupo B": ["CAN", "BIH", "QAT", "SUI"],
      "Grupo C": ["BRA", "MAR", "HAI", "SCO"],
      "Grupo D": ["USA", "PAR", "AUS", "TUR"],
      "Grupo E": ["GER", "CUW", "CIV", "ECU"],
      "Grupo F": ["NED", "JPN", "SWE", "TUN"],
      "Grupo G": ["BEL", "EGV", "IRN", "NZL"],
      "Grupo H": ["ESP", "CPV", "KSA", "URU"],
      "Grupo I": ["FRA", "SEN", "IRQ", "NOR"],
      "Grupo J": ["ARG", "ALG", "AUT", "JOR"],
      "Grupo K": ["POR", "COD", "UZB", "COL"],
      "Grupo L": ["ENG", "CRO", "GHA", "PAN"]
    };
    const OFFICIAL_GROUP_ORDER = ["FWC", ...Object.keys(OFFICIAL_WORLD_CUP_GROUPS), "Outros"];
    const OFFICIAL_GROUP_BY_CODE = Object.entries(OFFICIAL_WORLD_CUP_GROUPS).reduce((acc, [group, codes]) => {
      codes.forEach(code => acc[code] = group);
      return acc;
    }, {});

    function normalizeOwned(value) {
      if (typeof value === "boolean") return value;
      const v = String(value || "").trim().toLowerCase();
      return ["sim", "s", "yes", "y", "true", "1", "obtido", "tenho"].includes(v);
    }

    function normalizeDuplicates(value) {
      const parsed = Number.parseInt(String(value ?? "0").trim(), 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    function normalizeReserved(value) {
      return normalizeDuplicates(value);
    }

    function normalizePendingIncoming(value) {
      if (typeof value === "boolean") return value;
      const normalized = String(value || "").trim().toLowerCase();
      return ["sim", "yes", "true", "1", "pendente", "a_receber"].includes(normalized);
    }

    function normalizePendingPerson(value) {
      return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
    }

    function normalizePendingDuplicate(value) {
      if (typeof value === "boolean") return value;
      const normalized = String(value || "").trim().toLowerCase();
      return ["sim", "yes", "true", "1", "repetido", "duplicate"].includes(normalized);
    }

    function normalizeIncomingReservations(value, legacy = {}) {
      let raw = value;
      const hasExplicitValue = raw !== undefined && raw !== null && !(typeof raw === "string" && !raw.trim());
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) raw = [];
        else {
          try { raw = JSON.parse(trimmed); } catch { raw = []; }
        }
      }
      const list = Array.isArray(raw) ? raw : [];
      const normalized = list.map(item => ({
        tradeId: String(item?.tradeId || item?.trocaId || "").trim().slice(0, 80),
        person: normalizePendingPerson(item?.person || item?.pessoa || item?.from || item?.de),
        agreedDate: String(item?.agreedDate || item?.date || item?.createdAt || "").slice(0, 40),
        asDuplicate: normalizePendingDuplicate(item?.asDuplicate ?? item?.comoRepetido),
        count: Math.max(1, normalizeDuplicates(item?.count ?? item?.quantidade ?? 1))
      })).filter(item => item.tradeId);

      if (!hasExplicitValue && !normalized.length && normalizePendingIncoming(legacy.pendenteReceber)) {
        const person = normalizePendingPerson(legacy.pendenteDe) || "Sem nome";
        const agreedDate = String(legacy.pendenteDesde || "").slice(0, 40) || "sem-data";
        normalized.push({
          tradeId: String(legacy.pendenteTrocaId || `legacy:${person}:${agreedDate}`).trim().slice(0, 80),
          person,
          agreedDate,
          asDuplicate: normalizePendingDuplicate(legacy.pendenteComoRepetido),
          count: 1
        });
      }
      return normalized.filter(item => item.tradeId);
    }

    function incomingReservations(sticker) {
      return normalizeIncomingReservations(sticker?.rececoesPendentes, sticker || {});
    }

    function syncIncomingReservationLegacy(sticker) {
      const first = incomingReservations(sticker)[0];
      sticker.rececoesPendentes = incomingReservations(sticker);
      sticker.pendenteReceber = Boolean(first);
      sticker.pendenteDe = first?.person || "";
      sticker.pendenteDesde = first?.agreedDate || "";
      sticker.pendenteTrocaId = first?.tradeId || "";
      sticker.pendenteComoRepetido = Boolean(first?.asDuplicate);
      return sticker;
    }

    function isPendingIncoming(sticker) {
      return incomingReservations(sticker).length > 0;
    }

    function applyCompletedIncomingReceipt(sticker, receipt) {
      const count = Math.max(1, normalizeDuplicates(receipt?.count ?? 1));
      if (sticker.tenho || normalizePendingDuplicate(receipt?.asDuplicate)) {
        sticker.tenho = true;
        sticker.repetidos = normalizeDuplicates(sticker.repetidos) + count;
      } else {
        sticker.tenho = true;
        sticker.repetidos = normalizeDuplicates(sticker.repetidos) + Math.max(0, count - 1);
      }
      return sticker;
    }

    function splitIncomingEntries(entries) {
      const toCollect = [];
      const asDuplicates = [];
      (entries || []).forEach(entry => {
        const count = Math.max(1, normalizeDuplicates(entry?.count ?? 1));
        const alreadyOwned = Boolean(entry?.sticker?.tenho) || normalizePendingDuplicate(entry?.asDuplicate);
        if (alreadyOwned) {
          asDuplicates.push({ ...entry, count });
          return;
        }
        toCollect.push({ ...entry, count: 1 });
        if (count > 1) asDuplicates.push({ ...entry, count: count - 1, asDuplicate: true });
      });
      return { toCollect, asDuplicates };
    }

    function normalizeReservationPerson(value) {
      return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40) || "Sem nome";
    }

    function normalizeReservations(value) {
      let raw = value;
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try { raw = JSON.parse(trimmed); } catch { return []; }
      }
      if (!Array.isArray(raw)) return [];
      return raw.map(item => ({
        person: normalizeReservationPerson(item.person || item.pessoa || item.name || item.nome),
        count: normalizeDuplicates(item.count ?? item.quantidade ?? item.qtd ?? 1),
        createdAt: item.createdAt || item.agreedDate || new Date().toISOString(),
        tradeId: String(item.tradeId || item.trocaId || "").trim().slice(0, 80)
      })).filter(item => item.count > 0);
    }

    function reservationTotal(sticker) {
      if (!Array.isArray(sticker?.reservas)) return 0;
      return normalizeReservations(sticker.reservas).reduce((sum, item) => sum + item.count, 0);
    }

    function syncStickerReservations(sticker) {
      if (!sticker) return sticker;
      const duplicates = normalizeDuplicates(sticker.repetidos);
      if (Array.isArray(sticker.reservas) && sticker.reservas.length) {
        let remaining = duplicates;
        sticker.reservas = normalizeReservations(sticker.reservas).map(item => {
          const count = Math.min(item.count, remaining);
          remaining -= count;
          return { ...item, count };
        }).filter(item => item.count > 0);
        sticker.reservados = Math.min(reservationTotal(sticker), duplicates);
      } else {
        sticker.reservados = Math.min(normalizeReserved(sticker.reservados), duplicates);
      }
      return sticker;
    }

    function reservedDuplicates(sticker) {
      const detailed = reservationTotal(sticker);
      const raw = detailed > 0 ? detailed : normalizeReserved(sticker?.reservados);
      return Math.min(raw, normalizeDuplicates(sticker?.repetidos));
    }

    function availableDuplicates(sticker) {
      return Math.max(0, normalizeDuplicates(sticker?.repetidos) - reservedDuplicates(sticker));
    }


    function makeId(sticker) {
      return `${sticker.pais}__${sticker.codigo}`.toLowerCase().replace(/\s+/g, "_");
    }

    function cleanSticker(item) {
      const sticker = {
        pais: String(item.pais || item["pais"] || item["país"] || item.country || "Sem país").trim(),
        codigo: String(item.codigo || item["código"] || item.code || item.id || "").trim(),
        nome: String(item.nome || item.name || item.jogador || item.player || "").trim(),
        tenho: normalizeOwned(item.tenho ?? item.owned ?? item.obtido ?? item.have),
        repetidos: normalizeDuplicates(item.repetidos ?? item.duplicados ?? item.duplicates ?? item.duplicatesCount),
        reservados: normalizeReserved(item.reservados ?? item.suspensos ?? item.guardados ?? item.reserved ?? item.held ?? item.inativos),
        reservas: normalizeReservations(item.reservas ?? item.reservations ?? item.reservedFor ?? item.reservasJson),
        pendenteReceber: normalizePendingIncoming(item.pendenteReceber ?? item.pendentereceber ?? item.incomingPending ?? item.incomingpending ?? item.aReceber ?? item.areceber),
        pendenteDe: normalizePendingPerson(item.pendenteDe ?? item.pendentede ?? item.incomingFrom ?? item.incomingfrom ?? item.aReceberDe ?? item.areceberde),
        pendenteDesde: String(item.pendenteDesde ?? item.pendentedesde ?? item.incomingSince ?? item.incomingsince ?? "").slice(0, 40),
        pendenteTrocaId: String(item.pendenteTrocaId ?? item.pendentetrocaid ?? item.incomingTradeId ?? item.incomingtradeid ?? "").trim().slice(0, 80),
        pendenteComoRepetido: normalizePendingDuplicate(item.pendenteComoRepetido ?? item.pendentecomorepetido ?? item.incomingAsDuplicate ?? item.incomingasduplicate),
        rececoesPendentes: normalizeIncomingReservations(item.rececoesPendentes ?? item.rececoespendentes ?? item.incomingReservations ?? item.incomingreservations, item)
      };

      if (!sticker.codigo) sticker.codigo = `${sticker.pais}-${Math.random().toString(36).slice(2, 7)}`;
      if (!sticker.nome) sticker.nome = "Sem nome definido";

      sticker.id = makeId(sticker);
      if (!sticker.tenho) {
        sticker.repetidos = 0;
        sticker.reservados = 0;
        sticker.reservas = [];
      }
      syncIncomingReservationLegacy(sticker);
      syncStickerReservations(sticker);
      return sticker;
    }

    function parseCSVLine(line) {
      const result = [];
      let current = "";
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && next === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if ((char === "," || char === ";") && !insideQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    }

    function parseTextFile(text) {
      const trimmed = text.trim();

      if (!trimmed) return [];

      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const json = JSON.parse(trimmed);
        const arr = Array.isArray(json) ? json : json.cromos || json.stickers || [];
        return arr.map(cleanSticker);
      }

      const lines = trimmed.split(/\r?\n/).filter(Boolean);
      const firstLine = parseCSVLine(lines[0]);
      const hasHeader = firstLine.some(h => ["pais", "país", "country", "codigo", "código", "code", "nome", "name", "tenho", "owned", "repetidos", "duplicados", "duplicates", "reservados", "suspensos", "guardados", "reserved", "held", "inativos", "reservas", "reservations", "reservedfor", "reservasjson", "pendentereceber", "incomingpending", "areceber", "pendentede", "incomingfrom", "areceberde", "pendentedesde", "incomingsince", "pendentetrocaid", "incomingtradeid", "pendentecomorepetido", "incomingasduplicate", "rececoespendentes", "incomingreservations"].includes(h.trim().toLowerCase()));

      let headers = ["pais", "codigo", "nome", "tenho"];
      let start = 0;

      if (hasHeader) {
        headers = firstLine.map(h => h.trim().toLowerCase());
        start = 1;
      }

      return lines.slice(start).map(line => {
        const values = parseCSVLine(line);
        const item = {};
        headers.forEach((header, index) => item[header] = values[index] || "");
        return cleanSticker(item);
      });
    }

    function readSavedState() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      } catch {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        return {};
      }
    }

    function mergeWithSavedState(list) {
      const saved = readSavedState();
      return list.map(sticker => {
        const savedSticker = saved[sticker.id];
        if (savedSticker !== undefined) {
          if (typeof savedSticker === "object") {
            sticker.tenho = Boolean(savedSticker.tenho);
            sticker.repetidos = normalizeDuplicates(savedSticker.repetidos);
            sticker.reservas = normalizeReservations(savedSticker.reservas);
            sticker.pendenteReceber = normalizePendingIncoming(savedSticker.pendenteReceber);
            sticker.pendenteDe = normalizePendingPerson(savedSticker.pendenteDe);
            sticker.pendenteDesde = String(savedSticker.pendenteDesde || "").slice(0, 40);
            sticker.pendenteTrocaId = String(savedSticker.pendenteTrocaId || "").trim().slice(0, 80);
            sticker.pendenteComoRepetido = normalizePendingDuplicate(savedSticker.pendenteComoRepetido);
            sticker.rececoesPendentes = normalizeIncomingReservations(savedSticker.rececoesPendentes, savedSticker);
            syncIncomingReservationLegacy(sticker);
            sticker.reservados = Array.isArray(savedSticker.reservas) && savedSticker.reservas.length
              ? reservationTotal(sticker)
              : Math.min(normalizeReserved(savedSticker.reservados), sticker.repetidos);
            syncStickerReservations(sticker);
          } else {
            sticker.tenho = savedSticker;
          }
        }
        return sticker;
      });
    }

    function stickersToCSV() {
      const header = "pais,codigo,nome,tenho,repetidos,reservados,reservas,pendenteReceber,pendenteDe,pendenteDesde,pendenteTrocaId,pendenteComoRepetido,rececoesPendentes";
      const rows = stickers.map(s => [
        s.pais,
        s.codigo,
        s.nome,
        s.tenho ? "sim" : "nao",
        s.repetidos || 0,
        reservedDuplicates(s),
        JSON.stringify(normalizeReservations(s.reservas)),
        isPendingIncoming(s) ? "sim" : "nao",
        normalizePendingPerson(s.pendenteDe),
        isPendingIncoming(s) ? String(s.pendenteDesde || "") : "",
        isPendingIncoming(s) ? String(s.pendenteTrocaId || "") : "",
        isPendingIncoming(s) && normalizePendingDuplicate(s.pendenteComoRepetido) ? "sim" : "nao",
        JSON.stringify(incomingReservations(s))
      ].map(v => `"${String(v).replaceAll('"', '""')}"`).join(","));

      return [header, ...rows].join("\n");
    }

    function setStartupMessage(text) {
      if (startupMessage) startupMessage.textContent = text || "A preparar a app...";
    }

    function hideStartupScreen() {
      document.body.classList.remove("app-booting");
      if (startupScreen) startupScreen.setAttribute("aria-hidden", "true");
    }
    function setSaveStatus(text) {
      if (saveStatus) saveStatus.textContent = text;
    }

    function stickerToastText(sticker, action = "owned") {
      const code = exportGroupLabel(sticker.pais);
      const number = stickerExportNumber(sticker);
      const label = `CROMO ${code} ${number}`;
      if (action === "removed") return `${label} DESCOLADO DA CADERNETA`;
      if (action === "duplicate-added") return `${label} POSTO NO MONTE DE REPETIDOS`;
      if (action === "duplicate-removed") return `${label} RETIRADO DO MONTE DE REPETIDOS`;
      return `${label} COLADO NA CADERNETA`;
    }

    function showStickerToast(sticker, action = "owned") {
      const stackId = "stickerToastStack";
      let stack = document.getElementById(stackId);
      if (!stack) {
        stack = document.createElement("div");
        stack.id = stackId;
        stack.className = "sticker-toast-stack";
        document.body.appendChild(stack);
      }

      const toast = document.createElement("div");
      toast.className = "sticker-toast";
      toast.textContent = stickerToastText(sticker, action);
      stack.appendChild(toast);
      setTimeout(() => toast.remove(), 2300);
    }

    function hasSelectedFriend() {
      return Boolean(friendProfile);
    }

    function isFriendView() {
      return activePage === "friends" && hasSelectedFriend();
    }

    function applyFriendColor(color = friendUserColor) {
      friendUserColor = sanitizeUserColor(color);
      document.documentElement.style.setProperty("--friend-color", friendUserColor);
      document.documentElement.style.setProperty("--friend-color-soft", appThemeMode === "dark" ? darkenColor(friendUserColor, 0.24) : lightenColor(friendUserColor, 0.74));
    }

    function currentAlbumStickers() {
      if (activePage === "friends") return hasSelectedFriend() ? friendStickers : [];
      return stickers;
    }

    function currentAlbumLabel() {
      return isFriendView() ? friendProfile : "a tua caderneta";
    }

    function scheduleRender() {
      if (renderFrame) return;
      renderFrame = requestAnimationFrame(() => {
        renderFrame = 0;
        render();
      });
    }


    function saveState(changedStickerIds = null) {
      if (!liveEnabled || !liveProfile) {
        const state = {};
        stickers.forEach(sticker => {
          state[sticker.id] = {
            tenho: sticker.tenho,
            repetidos: sticker.repetidos || 0,
            reservados: reservedDuplicates(sticker),
            reservas: normalizeReservations(sticker.reservas),
            pendenteReceber: isPendingIncoming(sticker),
            pendenteDe: normalizePendingPerson(sticker.pendenteDe),
            pendenteDesde: isPendingIncoming(sticker) ? String(sticker.pendenteDesde || "") : "",
            pendenteTrocaId: isPendingIncoming(sticker) ? String(sticker.pendenteTrocaId || "") : "",
            pendenteComoRepetido: isPendingIncoming(sticker) && normalizePendingDuplicate(sticker.pendenteComoRepetido),
            rececoesPendentes: incomingReservations(sticker)
          };
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.warn("Nao foi poss\u00edvel gravar o estado local.", error);
        }
      }

      const changedIds = Array.isArray(changedStickerIds)
        ? changedStickerIds.map(value => String(value || "").trim()).filter(Boolean)
        : [];
      if (changedIds.length && !fullSyncPending) {
        changedIds.forEach(id => pendingStickerIds.add(id));
      } else {
        fullSyncPending = true;
        pendingStickerIds.clear();
      }

      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        persistStateNow().catch(error => {
          setSaveStatus(liveEnabled && liveProfile ? "Erro ao sincronizar online" : "Erro ao gravar alteracoes");
          console.error(error);
        });
      }, 150);
    }

    function activateStat(event, view) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setView(view);
    }
    function viewTitleText(view) {
      return {
        all: "Cromos Todos",
        missing: "Cromos em Falta",
        owned: "Cromos Obtidos",
        duplicates: "Cromos Repetidos",
        reserved: "Trocas reservadas"
      }[view] || "Cromos Todos";
    }

    function updateViewTitle() {
      if (activePage === "friends") {
        currentViewTitle.textContent = hasSelectedFriend()
          ? `Caderneta de ${friendProfile}`
          : "Amigos";
        return;
      }

      if (activePage === "tools") {
        currentViewTitle.textContent = "Ferramentas";
        return;
      }

      if (activePage === "compare") {
        currentViewTitle.textContent = "Listas";
        return;
      }

      if (activePage === "notifications") {
        currentViewTitle.textContent = "Notificacoes";
        return;
      }

      if (activePage === "history") {
        currentViewTitle.textContent = "Historico";
        return;
      }

      if (activePage === "account") {
        currentViewTitle.textContent = "Conta";
        return;
      }

      if (activePage === "settings") {
        currentViewTitle.textContent = "Definições";
        return;
      }

      currentViewTitle.textContent = viewTitleText(currentView);
    }

    function updatePageVisibility() {
      const showAlbum = activePage === "album" || (activePage === "friends" && hasSelectedFriend());
      if (!showAlbum && countryModalOpen) {
        countryModalOpen = false;
        selectedCountry = "all";
        modalView = "all";
        document.body.classList.remove("modal-open");
      }
      if (activePage !== "friends" && tradeModalOpen) {
        closeTradeModal();
      }
      if (activePage !== "album" && reserveModalOpen) {
        closeReserveModal();
      }
      if (activePage !== "settings" && activePage !== "account" && mobileToolsModalOpen) {
        closeMobileToolsModal();
      }
      albumDashboard?.classList.toggle("hidden", !showAlbum);
      document.body.classList.toggle("duplicates-view", showAlbum && currentView === "duplicates");
      albumStats?.classList.toggle("hidden", !showAlbum);
      collectionProgress?.classList.toggle("hidden", !showAlbum);
      albumHomeTitle?.classList.add("hidden");
      if (albumHomeTitleMain) albumHomeTitleMain.textContent = isFriendView() ? `Caderneta de ${friendProfile}` : "Selecoes";
      if (albumHomeTitleSub) albumHomeTitleSub.textContent = isFriendView()
        ? "Consulta os cromos deste amigo sem alterar a tua caderneta."
        
        : "Escolhe uma selecao para abrir a caderneta.";
      albumToolbar?.classList.toggle("hidden", !showAlbum);
      homeDashboard?.classList.toggle("hidden", !shouldShowHomeDashboard());
      friendModeBanner?.classList.toggle("hidden", !isFriendView());
      friendTradePrompt?.classList.toggle("hidden", !isFriendView());
      renderFriendTradePrompt();
      if (friendBannerName) friendBannerName.textContent = friendProfile ? `Caderneta de ${friendProfile}` : "Caderneta do amigo";
      updateFriendAlbumHeader();
      document.body.classList.toggle("friend-view", isFriendView());
      applyFriendColor(isFriendView() ? friendUserColor : DEFAULT_USER_COLOR);
      resultSummary?.classList.toggle("hidden", !showAlbum);
      countryTabsWrap?.classList.toggle("hidden", !showAlbum);
      content?.classList.toggle("hidden", !showAlbum);
      livePanel?.classList.toggle("hidden", activePage !== "friends");
      tradePanel?.classList.add("hidden");
      toolsPanel?.classList.toggle("hidden", activePage !== "tools");
      listComparePanel?.classList.toggle("hidden", activePage !== "compare");
      bulkAddPanel?.classList.toggle("hidden", activePage !== "compare" || activeListTool !== "add");
      notificationsPanel?.classList.toggle("hidden", activePage !== "notifications");
      historyPanel?.classList.toggle("hidden", activePage !== "history");
      accountPanel?.classList.toggle("hidden", activePage !== "account");
      settingsPanel?.classList.toggle("hidden", activePage !== "settings");
      if (activePage === "account") renderAccountOverview();
      updateListToolUI();
      updateMobileBottomNav();
      updateDesktopNav();
      updateViewTitle();
    }

    function updateFriendAlbumHeader() {
      if (!isFriendView()) return;
      const duplicateCopies = friendStickers.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      if (friendViewAvatar) {
        friendViewAvatar.style.background = friendUserColor || DEFAULT_USER_COLOR;
        applyProfilePhoto(friendViewAvatar, profilePhotos[friendProfile] || "", userInitial(friendProfile || "?"));
      }
      if (friendDuplicateCount) friendDuplicateCount.textContent = duplicateCopies;
      if (friendViewAllButton) {
        const active = currentView !== "duplicates";
        friendViewAllButton.classList.toggle("active", active);
        friendViewAllButton.setAttribute("aria-selected", String(active));
      }
      if (friendViewDuplicatesButton) {
        const active = currentView === "duplicates";
        friendViewDuplicatesButton.classList.toggle("active", active);
        friendViewDuplicatesButton.setAttribute("aria-selected", String(active));
      }
    }

    function setFriendAlbumView(view) {
      if (!isFriendView()) return;
      currentView = view === "duplicates" ? "duplicates" : "all";
      modalView = currentView;
      selectedCountry = "all";
      countryModalOpen = false;
      countryModalDuplicateOnly = false;
      if (search) search.value = "";
      document.body.classList.remove("modal-open");
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function clearAlbumFilters() {
      currentView = "all";
      modalView = "all";
      selectedCountry = "all";
      countryModalOpen = false;
      if (search) search.value = "";
      document.body.classList.remove("modal-open");
    }

    function switchAppPage(page, options = {}) {
      if (options.clearFilters !== false) clearAlbumFilters();
      activePage = page;
      closeUserMenu();
      updatePageVisibility();
      renderHomeDashboard();
      renderCountryModal();
      pulseViewTitle();
      if (options.scrollTop !== false) window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function setActivePage(page) {
      switchAppPage(page);
    }

    function goHome() {
      clearAlbumFilters();
      activePage = "album";
      friendProfile = "";
      friendStickers = [];
      friendUpdatedAt = "";
      friendUserColor = DEFAULT_USER_COLOR;
      syncFriendSelects("");
      closeUserMenu();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function updateActiveStat() {
      document.querySelectorAll(".stat[data-view]").forEach(stat => {
        stat.classList.remove("active");
      });
    }

    function pulseViewTitle() {
      currentViewTitle.classList.remove("is-changing");
      void currentViewTitle.offsetWidth;
      currentViewTitle.classList.add("is-changing");
    }

    function setView(view) {
      currentView = view;
      modalView = "all";
      selectedCountry = "all";
      countryModalOpen = false;
      countryModalDuplicateOnly = false;
      document.body.classList.remove("modal-open");
      updateViewTitle();
      updateActiveStat();
      pulseViewTitle();
      render();
      requestAnimationFrame(focusSelectedCountryTab);
    }


    function countryProgressFor(country) {
      const list = currentAlbumStickers().filter(sticker => sticker.pais === country);
      const total = list.length;
      const owned = list.filter(sticker => sticker.tenho).length;
      const percent = total ? Math.round((owned / total) * 100) : 0;
      return { total, owned, percent, missing: total - owned };
    }
    function shouldShowHomeDashboard() {
      return false;
    }

    function dashboardCountryCard(country, label) {
      const stats = countryProgressFor(country);
      return `
        <button class="dashboard-card" type="button" onclick="openCountryModal('${escapeJS(country)}')">
          <span>${escapeHTML(label)}</span>
          <strong>${escapeHTML(countryFullName(country) || exportGroupLabel(country))}</strong>
          <small>${countryProgressLabel(stats, { compact: false, suffix: " obtidos" })}</small>
          <div class="dashboard-progress" aria-hidden="true"><i style="--progress-width:${stats.percent}%"></i></div>
        </button>
      `;
    }

    function renderHomeDashboard() {
      homeDashboard?.classList.add("hidden");
      if (homeDashboardGrid) homeDashboardGrid.innerHTML = "";
    }

    function countryMatchesCollectionMode(country) {
      const progress = countryProgressFor(country);
      if (collectionMode === "complete") return progress.total > 0 && progress.missing === 0;
      if (collectionMode === "incomplete") return progress.missing > 0;
      if (collectionMode === "almost") return progress.missing > 0 && progress.percent >= 75;
      return true;
    }

    function setCollectionMode(mode) {
      collectionMode = ["all", "incomplete", "almost", "complete"].includes(mode) ? mode : "all";
      localStorage.setItem(COLLECTION_MODE_KEY, collectionMode);
      if (collectionModeSelect) collectionModeSelect.value = collectionMode;
      render();
    }
    function albumCountries() {
      const countries = [];
      const seen = new Set();

      currentAlbumStickers().forEach(sticker => {
        if (seen.has(sticker.pais)) return;
        seen.add(sticker.pais);
        if (countryMatchesCollectionMode(sticker.pais)) countries.push(sticker.pais);
      });

      return countries;
    }

    function allCountriesForAlbum(album = currentAlbumStickers()) {
      return [...new Set((album || []).map(sticker => sticker.pais).filter(Boolean))];
    }



    function maxCountryTabsOffset() {
      const viewport = countryTabs?.closest?.(".country-tabs-viewport");
      if (!countryTabs || !viewport) return 0;
      return Math.max(0, countryTabs.scrollWidth - viewport.clientWidth);
    }

    function applyCountryTabsOffset() {
      if (!countryTabs) return;
      const maxOffset = maxCountryTabsOffset();
      countryTabsOffset = Math.max(0, Math.min(countryTabsOffset, maxOffset));
      countryTabs.style.transform = countryTabsOffset ? "translateX(" + (-countryTabsOffset) + "px)" : "";
    }

    function focusSelectedCountryTab() {
      const selected = countryTabs?.querySelector?.(".country-card.active, .country-tab.active");
      const viewport = countryTabs?.closest?.(".country-tabs-viewport");
      if (!selected || !viewport) {
        applyCountryTabsOffset();
        return;
      }
      const selectedLeft = selected.offsetLeft;
      const selectedRight = selectedLeft + selected.offsetWidth;
      if (selectedLeft < countryTabsOffset) countryTabsOffset = selectedLeft - 12;
      if (selectedRight > countryTabsOffset + viewport.clientWidth) countryTabsOffset = selectedRight - viewport.clientWidth + 12;
      applyCountryTabsOffset();
    }

    function scrollCountryTabs(direction) {
      countryTabsOffset += direction * 180;
      applyCountryTabsOffset();
    }

    function startCountryScroll(direction) {
      stopCountryScroll();
      const step = () => {
        const previousOffset = countryTabsOffset;
        countryTabsOffset += direction * 2.8;
        applyCountryTabsOffset();
        if (countryTabsOffset === previousOffset && (countryTabsOffset <= 0 || countryTabsOffset >= maxCountryTabsOffset())) {
          stopCountryScroll();
          return;
        }
        countryScrollFrame = requestAnimationFrame(step);
      };
      countryScrollFrame = requestAnimationFrame(step);
    }

    function stopCountryScroll() {
      if (!countryScrollFrame) return;
      cancelAnimationFrame(countryScrollFrame);
      countryScrollFrame = null;
    }

    function openCountryFromHeader(country) {
      openCountryModal(country);
    }
    function setCountry(country) {
      if (country === "all") {
        closeCountryModal();
        return;
      }
      openCountryModal(country);
    }

    function openCountryModal(country) {
      selectedCountry = country;
      countryModalDuplicateOnly = false;
      modalView = "all";
      countryModalOpen = true;
      document.body.classList.add("modal-open");
      render();
    }

    function closeCountryModal() {
      countryModalOpen = false;
      countryModalDuplicateOnly = false;
      selectedCountry = "all";
      modalView = "all";
      document.body.classList.remove("modal-open");
      render();
    }

    function setModalView(view) {
      modalView = view;
      renderCountryModal();
    }

    function filteredStickers(options = {}) {
      const term = search.value.trim();
      const countryFilter = options.country || selectedCountry;
      const album = options.album || currentAlbumStickers();
      const viewFilter = options.view || currentView;
      const searchingSelectedCountry = countryFilter !== "all" && searchTermMatchesCountry(countryFilter, term);

      return album.filter(sticker => {
        const matchesView =
          viewFilter === "all" ||
          (viewFilter === "missing" && !sticker.tenho) ||
          (viewFilter === "owned" && sticker.tenho) ||
          (viewFilter === "duplicates" && sticker.tenho && availableDuplicates(sticker) > 0) ||
          (viewFilter === "reserved" && !isFriendView() && sticker.tenho && reservedDuplicates(sticker) > 0);

        const matchesCountry =
          countryFilter === "all" ||
          sticker.pais === countryFilter;

        const matchesSearch =
          !term ||
          searchingSelectedCountry ||
          stickerSearchRank(sticker, term) < 9;

        return matchesView && matchesCountry && matchesSearch;
      });
    }
    function groupByCountry(list) {
      return list.reduce((acc, sticker) => {
        if (!acc[sticker.pais]) acc[sticker.pais] = [];
        acc[sticker.pais].push(sticker);
        return acc;
      }, {});
    }

    function countryColor(country) {
      const code = String(country).split(" ")[0];
      const original = COUNTRY_COLORS[code] || "#111827";
      if (isFriendView()) return friendUserColor || DEFAULT_USER_COLOR;
      return original;
    }

    function countrySecondaryColor(country) {
      const code = String(country).split(" ")[0];
      const original = COUNTRY_SECONDARY_COLORS[code] || "#111827";
      if (isFriendView()) return appThemeMode === "dark" ? darkenColor(friendUserColor || DEFAULT_USER_COLOR, 0.2) : lightenColor(friendUserColor || DEFAULT_USER_COLOR, 0.72);
      return original;
    }


    function countryCheckboxColor(country) {
      const code = String(country).split(" ")[0];
      const original = COUNTRY_TERTIARY_COLORS[code] || COUNTRY_SECONDARY_COLORS[code] || "#111827";
      if (isFriendView()) return appThemeMode === "dark" ? lightenColor(friendUserColor || DEFAULT_USER_COLOR, 0.2) : darkenColor(friendUserColor || DEFAULT_USER_COLOR, 0.08);
      return original;
    }

    function countryProgressColor(country) {
      const code = String(country).split(" ")[0];
      const original = COUNTRY_PROGRESS_COLORS[code] || COUNTRY_SECONDARY_COLORS[code] || "#111827";
      if (isFriendView()) return original;
      return original;
    }

    function readableTextColor(hex) {
      const normalized = String(hex).replace("#", "");
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.62 ? "#111827" : "#ffffff";
    }

    function lightenColor(hex, amount = 0.72) {
      const normalized = String(hex).replace("#", "");
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      const mix = value => Math.round(value + (255 - value) * amount).toString(16).padStart(2, "0");
      return `#${mix(r)}${mix(g)}${mix(b)}`;
    }

    function darkenColor(hex, amount = 0.18) {
      const normalized = String(hex).replace("#", "");
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      const mix = value => Math.round(value * (1 - amount)).toString(16).padStart(2, "0");
      return `#${mix(r)}${mix(g)}${mix(b)}`;
    }

    function mixColors(a, b, amount = 0.5) {
      const left = String(a || "#111827").replace("#", "");
      const right = String(b || "#111827").replace("#", "");
      const blend = (start, end) => Math.round(start * (1 - amount) + end * amount).toString(16).padStart(2, "0");
      const ar = parseInt(left.slice(0, 2), 16);
      const ag = parseInt(left.slice(2, 4), 16);
      const ab = parseInt(left.slice(4, 6), 16);
      const br = parseInt(right.slice(0, 2), 16);
      const bg = parseInt(right.slice(2, 4), 16);
      const bb = parseInt(right.slice(4, 6), 16);
      return `#${blend(ar, br)}${blend(ag, bg)}${blend(ab, bb)}`;
    }


    function hexToRgba(hex, alpha) {
      const normalized = String(hex).replace("#", "");
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function sanitizeUserColor(value) {
      const color = String(value || "").trim().toLowerCase();
      return USER_COLOR_PALETTE.includes(color) ? color : DEFAULT_USER_COLOR;
    }

    function currentAppTheme() {
      const list = APP_THEMES[appThemeMode] || APP_THEMES.light;
      return list.find(theme => theme.id === appThemePresetId) || list[0];
    }

    function applyAppTheme(saveLocal = true) {
      const theme = currentAppTheme();
      const root = document.documentElement;
      root.style.setProperty("--bg", theme.bg);
      root.style.setProperty("--card", theme.card);
      root.style.setProperty("--panel", theme.panel);
      root.style.setProperty("--text", theme.text);
      root.style.setProperty("--muted", theme.muted);
      root.style.setProperty("--line", theme.line);
      root.style.setProperty("--main", theme.accent);
      root.style.setProperty("--ok", theme.accent);
      root.style.setProperty("--main-soft", lightenColor(theme.accent, appThemeMode === "dark" ? 0.18 : 0.34));
      root.style.setProperty("--header-bg", theme.header);
      document.body.dataset.themeMode = appThemeMode;
      document.body.dataset.countryMode = theme.countryMode;

      if (saveLocal) {
        try {
          localStorage.setItem(APP_THEME_KEY, JSON.stringify({ mode: appThemeMode, preset: appThemePresetId }));
        } catch {}
      }

      renderAppThemePalette();
      render();
    }

    function loadAppTheme() {
      try {
        const saved = JSON.parse(localStorage.getItem(APP_THEME_KEY) || "{}");
        if (saved.mode && APP_THEMES[saved.mode]) appThemeMode = saved.mode;
        if (saved.preset && APP_THEMES[appThemeMode].some(theme => theme.id === saved.preset)) appThemePresetId = saved.preset;
      } catch {}
      applyAppTheme(false);
    }

    function loadCountrySortMode() {
      try {
        const saved = localStorage.getItem(COUNTRY_SORT_KEY);
        if (["album", "alpha", "groups"].includes(saved)) countrySortMode = saved;
      } catch {}
      if (countrySortSelect) countrySortSelect.value = countrySortMode;
    }

    function setCountrySortMode(mode) {
      countrySortMode = ["album", "alpha", "groups"].includes(mode) ? mode : "album";
      if (countrySortSelect) countrySortSelect.value = countrySortMode;
      try {
        localStorage.setItem(COUNTRY_SORT_KEY, countrySortMode);
      } catch {}
      render();
    }

    function loadLocalThemeColor() {
      loadAppTheme();
    }

    function setAppThemeMode(mode) {
      if (!APP_THEMES[mode]) return;
      appThemeMode = mode;
      if (!APP_THEMES[appThemeMode].some(theme => theme.id === appThemePresetId)) appThemePresetId = "default";
      applyAppTheme();
      setSettingsMessage(settingsAppearanceMessage, `Tema ${mode === "dark" ? "dark" : "light"} aplicado.`);
    }

    function setAppThemePreset(id) {
      if (!APP_THEMES[appThemeMode].some(theme => theme.id === id)) return;
      appThemePresetId = id;
      applyAppTheme();
      setSettingsMessage(settingsAppearanceMessage, "Aparência aplicada.");
    }

    function renderAppThemePalette() {
      if (!appThemePalette) return;
      if (lightModeButton) lightModeButton.classList.toggle("active", appThemeMode === "light");
      if (darkModeButton) darkModeButton.classList.toggle("active", appThemeMode === "dark");
      appThemePalette.innerHTML = APP_THEMES[appThemeMode].map(theme => `
        <button
          class="color-swatch app-theme-swatch ${theme.id === appThemePresetId ? "is-active" : ""}"
          type="button"
          style="--swatch-color:${theme.card};--swatch-accent:${theme.accent};--swatch-line:${theme.line}"
          onclick="setAppThemePreset('${escapeJS(theme.id)}')"
          aria-label="${escapeHTML(theme.name)}"
          title="${escapeHTML(theme.name)}"
        ></button>
      `).join("");
    }

    function renderUserColorPalette() {
      if (!userColorPalette) return;
      const used = new Set(usedUserColors.map(sanitizeUserColor));
      userColorPalette.innerHTML = availableUserColors.map(color => {
        const disabled = color !== currentUserColor && color !== DEFAULT_USER_COLOR && used.has(color);
        const title = disabled ? "Cor já usada por outro user" : color;
        return `
          <button
            class="color-swatch ${color === currentUserColor ? "is-active" : ""}"
            type="button"
            style="--swatch-color:${color}"
            onclick="chooseThemeColor('${color}')"
            aria-label="${escapeHTML(title)}"
            title="${escapeHTML(title)}"
            ${disabled ? "disabled" : ""}
          ></button>
        `;
      }).join("");
      if (themeColorInput) themeColorInput.value = currentUserColor;
      if (themeColorTextInput) themeColorTextInput.value = currentUserColor;
    }

    function syncThemeControls() {
      renderUserColorPalette();
      renderAppThemePalette();
    }

    function setSettingsMessage(target, text, isError = false) {
      if (!target) return;
      target.textContent = text || "";
      target.classList.toggle("is-error", Boolean(isError));
    }

    function chooseThemeColor(color) {
      const chosen = sanitizeUserColor(color);
      const used = new Set(usedUserColors.map(sanitizeUserColor));
      if (chosen !== currentUserColor && chosen !== DEFAULT_USER_COLOR && used.has(chosen)) {
        setSettingsMessage(settingsThemeMessage, "Essa cor já está a ser usada por outro user.", true);
        return;
      }
      currentUserColor = chosen;
      try {
        localStorage.setItem(USER_COLOR_KEY, currentUserColor);
      } catch {}
      document.documentElement.style.setProperty("--user-color", currentUserColor);
      renderUserColorPalette();
      syncProfilePhotoUI();
      setSettingsMessage(settingsThemeMessage, "Cor escolhida. Guarda para ficar associada à tua conta.");
    }

    function previewThemeColor() {
      chooseThemeColor(themeColorInput?.value || themeColorTextInput?.value);
    }

    async function saveThemeSettings() {
      if (!requireLiveLogin()) return;
      const color = sanitizeUserColor(currentUserColor);

      try {
        const data = await authRequest("/api/auth/settings", { userColor: color });
        applyUserSettings(data.settings || {});
        setSettingsMessage(settingsThemeMessage, "Cor guardada com sucesso.");
        setSaveStatus("Cor do user guardada");
      } catch (error) {
        setSettingsMessage(settingsThemeMessage, error.message, true);
        setSaveStatus("Erro ao guardar cor do user");
      }
    }

    async function saveProfilePhotoSettings(photo) {
      if (!requireLiveLogin()) return;
      const data = await authRequest("/api/auth/settings", {
        userColor: sanitizeUserColor(currentUserColor),
        profilePhoto: photo || ""
      });
      applyUserSettings(data.settings || {});
      setSaveStatus(photo ? "Foto do user guardada" : "Foto do user removida");
    }

    function resetThemeColor() {
      chooseThemeColor(DEFAULT_USER_COLOR);
    }

    function applyUserSettings(settings = {}) {
      currentUserColor = sanitizeUserColor(settings.userColor || currentUserColor);
      onlineProfilePhoto = typeof settings.profilePhoto === "string" ? settings.profilePhoto : onlineProfilePhoto;
      availableUserColors = Array.isArray(settings.colorPalette) && settings.colorPalette.length
        ? settings.colorPalette.map(sanitizeUserColor)
        : [...USER_COLOR_PALETTE];
      usedUserColors = Array.isArray(settings.usedColors) ? settings.usedColors.map(sanitizeUserColor) : [];
      try {
        localStorage.setItem(USER_COLOR_KEY, currentUserColor);
      } catch {}
      document.documentElement.style.setProperty("--user-color", currentUserColor);
      renderUserColorPalette();
      syncProfilePhotoUI();
    }

    async function loadUserSettings() {
      if (!liveEnabled || !liveProfile) return;
      const response = await apiFetch("/api/auth/settings", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nao foi poss\u00edvel ler as definicoes");
      applyUserSettings(data.settings || {});
    }

    function clearPasswordInputs(...inputs) {
      inputs.forEach(input => {
        if (input) input.value = "";
      });
    }

    function validatePasswordChangePayload(username, currentPassword, newPassword, confirmPassword) {
      if (!username || !currentPassword || !newPassword || !confirmPassword) {
        return "Preenche todos os campos.";
      }
      if (newPassword.length < 8) return "A nova password deve ter pelo menos 8 caracteres.";
      if (newPassword !== confirmPassword) return "A confirmacao nao coincide.";
      if (currentPassword === newPassword) return "A nova password tem de ser diferente da atual.";
      return "";
    }

    function tabStyle(country) {
      const hoverBg = lightenColor(countryColor(country));
      const hoverText = readableTextColor(hoverBg);
      const rules = [`--tab-hover-bg:${hoverBg}`, `--tab-hover-text:${hoverText}`];

      if (selectedCountry === country) {
        const bg = countryColor(country);
        const text = readableTextColor(bg);
        rules.push(`background:${bg}`, `border-color:${bg}`, `color:${text}`);
      }

      return ` style="${rules.join(";")}"`;
    }

    function checkboxStyle(country) {
      const color = countryCheckboxColor(country).toLowerCase();
      const mark = readableTextColor(color);
      return `--check-bg:${color};--check-border:${color};--check-mark:${mark};--sticker-shadow:${hexToRgba(color, .32)};--sticker-focus:${hexToRgba(color, .34)}`;
    }

    function duplicateStickerStyle(country) {
      const primary = countryColor(country).toLowerCase();
      const bg = appThemeMode === "dark" ? primary : mixColors("#ffffff", primary, 0.58);
      const text = readableTextColor(bg);
      const muted = text === "#ffffff" ? "rgba(255,255,255,.82)" : "rgba(17,24,39,.72)";
      return `--duplicate-card-bg:${bg};--duplicate-card-border:${primary};--duplicate-card-text:${text};--duplicate-card-muted:${muted};--duplicate-card-shadow:${hexToRgba(primary, .28)}`;
    }

    function duplicateInputStyle(country) {
      const color = countryCheckboxColor(country).toLowerCase();
      const text = readableTextColor(color);
      return `--duplicate-color:${color};--duplicate-text:${text}`;
    }
    function duplicateBadgeStyle(country) {
      const bg = countryCheckboxColor(country).toLowerCase();
      const text = readableTextColor(bg);
      return ` style="background:${bg};border-color:${bg};color:${text}"`;
    }

    function countryFullName(country) {
      if (country === "FWC - EQUIPAS HIST\u00d3RICAS") return "EQUIPAS HISTÓRICAS";
      const code = String(country).split(" ")[0];
      return COUNTRY_NAMES[code] || "";
    }

    function countryDisplayName(country) {
      return countryFullName(country) || country;
    }

    function officialGroupForCountry(country) {
      const code = exportGroupLabel(country);
      if (country === "FWC" || String(country).startsWith("FWC -")) return "FWC";
      return OFFICIAL_GROUP_BY_CODE[code] || "Outros";
    }

    function officialGroupRank(country) {
      const group = officialGroupForCountry(country);
      const index = OFFICIAL_GROUP_ORDER.indexOf(group);
      return index >= 0 ? index : OFFICIAL_GROUP_ORDER.length;
    }

    function officialGroupCountryRank(country) {
      const group = officialGroupForCountry(country);
      const code = exportGroupLabel(country);
      const codes = OFFICIAL_WORLD_CUP_GROUPS[group] || [];
      const index = codes.indexOf(code);
      return index >= 0 ? index : 99;
    }

    function compareCountryAlpha(a, b) {
      return countryDisplayName(a).localeCompare(countryDisplayName(b), "pt-PT", { sensitivity: "base" });
    }

    function sortedCountriesForList(countries, album, term = "") {
      const albumOrder = new Map(albumCountries().map((country, index) => [country, index]));
      const grouped = groupByCountry(album);

      return [...countries].sort((a, b) => {
        if (term) {
          const rank = countrySearchRank(a, grouped[a] || [], term) - countrySearchRank(b, grouped[b] || [], term);
          if (rank) return rank;
        }

        if (countrySortMode === "alpha") {
          return compareCountryAlpha(a, b) || (albumOrder.get(a) ?? 0) - (albumOrder.get(b) ?? 0);
        }

        if (countrySortMode === "groups") {
          const groupRank = officialGroupRank(a) - officialGroupRank(b);
          if (groupRank) return groupRank;
          const countryRank = officialGroupCountryRank(a) - officialGroupCountryRank(b);
          if (countryRank) return countryRank;
          return (albumOrder.get(a) ?? 0) - (albumOrder.get(b) ?? 0);
        }

        return (albumOrder.get(a) ?? 0) - (albumOrder.get(b) ?? 0);
      });
    }

    function renderCountryGroupTitle(group) {
      const label = group === "FWC" ? "FWC" : group;
      return `<div class="country-group-title">${escapeHTML(label)}</div>`;
    }

    function normalizeSearch(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");
    }

    function normalizeSearchWords(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    }

    function playerNameSearchRank(name, term) {
      if (!term) return 9;
      const compactTerm = normalizeSearch(term);
      const compactName = normalizeSearch(name);
      const words = normalizeSearchWords(name).split(" ").filter(Boolean);
      if (compactName === compactTerm) return 1;
      if (words.some(word => word === compactTerm)) return 2;
      if (compactTerm.length >= 4 && (compactName.includes(compactTerm) || words.some(word => word.includes(compactTerm)))) return 3;
      return 9;
    }

    function stickerSearchFields(sticker) {
      const name = normalizeSearchWords(sticker.nome);
      const countryCode = normalizeSearchWords(exportGroupLabel(sticker.pais));
      const countryName = normalizeSearchWords(countryFullName(sticker.pais));
      const code = normalizeSearchWords(sticker.codigo);
      const fields = [name, countryCode, countryName, code];

      if (/cromo equipa|team photo|team|equipa/.test(name)) {
        fields.push("equipa team foto fotografia teamphoto");
      }
      if (/cromo emblema|emblem|logo|emblema/.test(name)) {
        fields.push("emblema emblem logo simbolo");
      }

      return fields.filter(Boolean);
    }

    function stickerMatchesSearchTokens(sticker, term) {
      const tokens = normalizeSearchWords(term).split(" ").filter(Boolean);
      if (!tokens.length) return false;
      const fields = stickerSearchFields(sticker);
      return tokens.every(token => fields.some(field =>
        field.split(" ").some(word => word === token || (token.length >= 3 && word.includes(token)))
      ));
    }

    function stickerSearchRank(sticker, term) {
      if (!term) return 0;

      const code = normalizeSearch(sticker.codigo);
      const compactTerm = normalizeSearch(term);

      if (code === compactTerm) return 0;
      const nameRank = playerNameSearchRank(sticker.nome, term);
      if (nameRank < 9) return nameRank;
      if (stickerMatchesSearchTokens(sticker, term)) return 5;
      return 9;
    }

    function stickerMatchesDirectSearch(sticker, term) {
      return stickerSearchRank(sticker, term) < 9;
    }

    function searchTermMatchesCountry(country, term) {
      if (!term) return false;
      const compactTerm = normalizeSearch(term);
      const countryCode = normalizeSearch(exportGroupLabel(country));
      const countryName = normalizeSearch(countryFullName(country));
      if (countryCode === compactTerm || countryName === compactTerm) return true;
      return compactTerm.length >= 4 && countryName.includes(compactTerm);
    }

    function countrySearchRank(country, countryStickers, term) {
      if (!term) return 0;

      const countryCode = normalizeSearch(country);
      const countryName = normalizeSearch(countryFullName(country));
      const compactTerm = normalizeSearch(term);

      if (countryCode === compactTerm || countryName === compactTerm) return 0;
      if (compactTerm.length >= 4 && countryName.includes(compactTerm)) return 1;
      if (countryStickers.some(sticker => stickerMatchesDirectSearch(sticker, term))) return 2;
      return 9;
    }

    function searchResultStickers(album, term) {
      if (!term) return [];
      return album
        .filter(sticker => stickerMatchesDirectSearch(sticker, term))
        .sort((a, b) => {
          const rank = stickerSearchRank(a, term) - stickerSearchRank(b, term);
          if (rank) return rank;
          return a.codigo.localeCompare(b.codigo, "pt-PT", { numeric: true });
        });
    }
    function sectionStyle(country) {
      const primary = countryColor(country);
      const secondary = countrySecondaryColor(country).toLowerCase();
      const base = secondary === "white" ? "#ffffff" : secondary;
      const check = countryCheckboxColor(country);
      const progressColor = countryProgressColor(country).toLowerCase();
      const progressText = readableTextColor(progressColor);
      if (appThemeMode === "dark") {
        const theme = currentAppTheme();
        const contentBg = theme.card;
        const stickerBg = base;
        const border = mixColors(theme.line, primary, 0.48);
        const headerText = readableTextColor(primary);
        const headerMuted = progressColor;
        const stickerText = readableTextColor(stickerBg);
        const stickerMuted = stickerText === "#ffffff" ? "rgba(255,255,255,.84)" : "rgba(17,24,39,.72)";
        const progressTrack = headerText === "#ffffff" ? "rgba(255,255,255,.25)" : "rgba(17,24,39,.22)";
        return `--section-header-bg:${primary};--section-content-bg:${contentBg};--sticker-bg:${stickerBg};--check-bg:${check};--check-border:${check};--section-border:${border};--section-text:${headerText};--header-muted:${headerMuted};--progress-text:${progressText};--sticker-text:${stickerText};--sticker-muted:${stickerMuted};--progress-track:${progressTrack};--progress-fill:${progressColor};--progress-fill-soft:${lightenColor(progressColor, 0.22)}`;
      }

      const stickerBg = base;
      const border = primary;
      const headerText = readableTextColor(primary);
      const headerMuted = progressColor;
      const stickerText = readableTextColor(stickerBg);
      const stickerMuted = stickerText === "#ffffff" ? "rgba(255,255,255,.84)" : "#374151";
      const progressTrack = headerText === "#ffffff" ? "rgba(255,255,255,.28)" : "rgba(17,24,39,.18)";
      return `--section-header-bg:${primary};--section-content-bg:#ffffff;--sticker-bg:${stickerBg};--check-bg:${check};--check-border:${check};--section-border:${border};--section-text:${headerText};--header-muted:${headerMuted};--progress-text:${progressText};--sticker-text:${stickerText};--sticker-muted:${stickerMuted};--progress-track:${progressTrack};--progress-fill:${progressColor};--progress-fill-soft:${lightenColor(progressColor, 0.22)}`;
    }

    function countryCardStyle(country) {
      const primary = countryColor(country);
      const progressColor = countryProgressColor(country).toLowerCase();
      const progressText = readableTextColor(progressColor);
      if (appThemeMode === "dark") {
        const theme = currentAppTheme();
        const border = mixColors(theme.line, primary, 0.55);
        const text = readableTextColor(primary);
        const muted = text === "#ffffff" ? "rgba(255,255,255,.82)" : "rgba(17,24,39,.72)";
        return `--country-primary:${primary};--country-soft:${primary};--country-border:${border};--country-text:${text};--country-muted:${muted};--country-progress:${progressColor};--country-progress-text:${progressText};--country-track:rgba(255,255,255,.22);--country-shadow:rgba(0,0,0,.32)`;
      }

      const text = readableTextColor(primary);
      const muted = text === "#ffffff" ? "rgba(255,255,255,.82)" : "#475569";
      return `--country-primary:${primary};--country-soft:${primary};--country-border:${primary};--country-text:${text};--country-muted:${muted};--country-progress:${progressColor};--country-progress-text:${progressText};--country-track:rgba(15,23,42,.18);--country-shadow:${hexToRgba(primary, .18)}`;
    }

    function nativeCountryCardStyle(country) {
      const code = String(country).split(" ")[0];
      const primary = (COUNTRY_COLORS[code] || "#111827").toLowerCase();
      const progressColor = (COUNTRY_PROGRESS_COLORS[code] || COUNTRY_SECONDARY_COLORS[code] || "#0ea5e9").toLowerCase();
      const progressText = readableTextColor(progressColor);
      if (appThemeMode === "dark") {
        const theme = currentAppTheme();
        const border = mixColors(theme.line, primary, 0.55);
        const text = readableTextColor(primary);
        const muted = text === "#ffffff" ? "rgba(255,255,255,.82)" : "rgba(17,24,39,.72)";
        return `--country-primary:${primary};--country-soft:${primary};--country-border:${border};--country-text:${text};--country-muted:${muted};--country-progress:${progressColor};--country-progress-text:${progressText};--country-track:rgba(255,255,255,.22);--country-shadow:rgba(0,0,0,.32)`;
      }

      const text = readableTextColor(primary);
      const muted = text === "#ffffff" ? "rgba(255,255,255,.82)" : "#475569";
      return `--country-primary:${primary};--country-soft:${primary};--country-border:${primary};--country-text:${text};--country-muted:${muted};--country-progress:${progressColor};--country-progress-text:${progressText};--country-track:rgba(15,23,42,.18);--country-shadow:${hexToRgba(primary, .18)}`;
    }

    function renderCountryTabs() {
      const countries = albumCountries();
      const term = search.value.trim();
      const album = currentAlbumStickers();
      const visibleCountries = countries
        .filter(country => {
          if (!term) return true;
          const countryStickers = album.filter(sticker => sticker.pais === country);
          return countrySearchRank(country, countryStickers, term) < 9;
        });
      const orderedCountries = sortedCountriesForList(visibleCountries, album, term);

      if (countrySortMode === "groups") {
        let previousGroup = "";
        countryTabs.innerHTML = orderedCountries.map(country => {
          const group = officialGroupForCountry(country);
          const heading = group !== previousGroup ? renderCountryGroupTitle(group) : "";
          previousGroup = group;
          return `${heading}${renderCountryCard(country, album)}`;
        }).join("");
        return;
      }

      countryTabs.innerHTML = orderedCountries.map(country => renderCountryCard(country, album)).join("");
    }


    function stickerExportNumber(sticker) {
      const code = String(sticker.codigo || "").trim();
      if (code === "00") return "00";
      const match = code.match(/(\d+)\s*$/);
      return match ? String(Number(match[1])) : code;
    }

    function exportGroupLabel(country) {
      return String(country).split(" ")[0];
    }

    function countryCompleteMessage(country) {
      if (country === "FWC") return "Ja completou os Trofeus";
      if (country === "FWC - EQUIPAS HIST\u00d3RICAS") return "Ja completou as Equipas Historicas";
      return "Ja completou esta selecao";
    }

    function countryDuplicateEmptyMessage(country) {
      if (country === "FWC") return "Nao tem nenhum repetido dos Trofeus";
      if (country === "FWC - EQUIPAS HIST\u00d3RICAS") return "Nao tem nenhum repetido das Equipas Historicas";
      return "Nao tem nenhum repetido desta selecao";
    }

    function countryOwnedEmptyMessage(country) {
      if (country === "FWC") return "Nao tem nenhum cromo dos Trofeus";
      if (country === "FWC - EQUIPAS HIST\u00d3RICAS") return "Nao tem nenhum cromo das Equipas Historicas";
      return "Nao tem nenhum cromo desta selecao";
    }

    function emptyViewMessage(view = currentView, country = selectedCountry) {
      if (normalizeSearch(search.value)) return "Nao ha cromos para mostrar nesta pesquisa.";

      if (country === "all") {
        if (view === "missing") return isFriendView() ? `${friendProfile} ja completou a caderneta.` : "Já completaste a caderneta.";
        if (view === "owned") return isFriendView() ? `${friendProfile} ainda nao tem nenhum cromo obtido.` : "Ainda nao tens nenhum cromo obtido.";
        if (view === "duplicates") return isFriendView() ? `${friendProfile} nao tem nenhum cromo repetido.` : "Nao tens nenhum cromo repetido.";
        return "Nao ha cromos para mostrar nesta vista.";
      }

      if (view === "missing") return countryCompleteMessage(country);
      if (view === "owned") return countryOwnedEmptyMessage(country);
      if (view === "duplicates") return countryDuplicateEmptyMessage(country);
      if (view === "reserved") return "Nao tens cromos guardados nesta selecao.";
      return "Nao ha cromos para mostrar nesta selecao.";
    }

    async function copyTextToClipboard(text) {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      area.style.top = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      area.setSelectionRange(0, area.value.length);
      let copied = false;
      try { copied = document.execCommand("copy"); } catch { copied = false; }
      area.remove();
      return copied;
    }

    function downloadExportText(text) {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = isFriendView() ? `Mundial ${friendProfile} Cromos em Falta.txt` : "Mundial Cromos em Falta.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    }

    function exportGroupedLines(list, formatter) {
      return allCountriesForAlbum(stickers)
        .map(country => {
          const countryStickers = list
            .filter(sticker => sticker.pais === country)
            .sort((a, b) => stickerNumber(a) - stickerNumber(b));
          if (!countryStickers.length) return "";
          return `${exportGroupLabel(country)}: ${countryStickers.map(formatter).join(", ")}`;
        })
        .filter(Boolean);
    }

    async function exportMissingAndDuplicates() {
      const album = currentAlbumStickers();
      if (!album.length) {
        setSaveStatus("Sem cromos para exportar");
        return;
      }

      const pendingMissing = album.filter(sticker => !sticker.tenho && isPendingIncoming(sticker));
      const missing = album.filter(sticker => !sticker.tenho && !isPendingIncoming(sticker));
      const duplicates = album.filter(sticker => sticker.tenho && availableDuplicates(sticker) > 0);
      const duplicateTotal = duplicates.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const missingLines = exportGroupedLines(missing, sticker => stickerExportNumber(sticker));
      const duplicateLines = exportGroupedLines(duplicates, sticker => {
        const count = availableDuplicates(sticker);
        return count > 1 ? `${stickerExportNumber(sticker)} (${count})` : stickerExportNumber(sticker);
      });
      const lines = [];
      if (isFriendView()) lines.push(`Caderneta de ${friendProfile}`, "");
      if (missingLines.length) {
        lines.push(`Cromos em Falta (${missing.length}):`, "", ...missingLines);
      }
      if (duplicateLines.length) {
        if (lines.length) lines.push("");
        lines.push(`Cromos Repetidos (${duplicateTotal}):`, "", ...duplicateLines);
      }
      if (!lines.length) lines.push("Sem cromos em falta ou repetidos");
      if (pendingMissing.length) {
        lines.push("", `${pendingMissing.length} cromo${pendingMissing.length === 1 ? "" : "s"} a receber foram excluidos desta lista.`);
      }

      const exportText = `${lines.join("\r\n")}\r\n`;
      const copied = await copyTextToClipboard(exportText);
      if (copied) {
        setSaveStatus(isFriendView() ? `Lista de ${friendProfile} copiada` : "Lista copiada para colar");
        return;
      }
      downloadExportText(exportText);
      setSaveStatus("Nao foi poss\u00edvel copiar. Fiz download da lista.");
    }


    function compactComparisonLines(list, formatter = stickerExportNumber) {
      const ids = new Set(list.map(sticker => sticker.id));
      return allCountriesForAlbum(stickers)
        .map(country => {
          const countryStickers = currentAlbumStickers()
            .filter(sticker => sticker.pais === country && ids.has(sticker.id))
            .sort((a, b) => stickerNumber(a) - stickerNumber(b));
          if (!countryStickers.length) return "";
          return `${exportGroupLabel(country)}: ${countryStickers.map(formatter).join(", ")}`;
        })
        .filter(Boolean);
    }

    function renderComparisonLines(list, emptyText) {
      const lines = compactComparisonLines(list);
      if (!lines.length) return `<div class="comparison-empty">${escapeHTML(emptyText)}</div>`;
      return `<div class="comparison-lines">${lines.map(escapeHTML).join("<br>")}</div>`;
    }

    function normalizeListLabel(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
    }

    function listCountryAliases() {
      const aliases = new Map();
      const addAlias = (alias, code) => {
        const normalized = normalizeListLabel(alias);
        if (normalized && code && !aliases.has(normalized)) aliases.set(normalized, code);
      };
      const manualAliases = {
        FWC: ["FWC", "TROFEUS", "TROFEUS INICIAIS", "EQUIPAS HISTORICAS"],
        MEX: ["MEXICO"],
        RSA: ["AFRICA DO SUL", "SOUTH AFRICA"],
        KOR: ["COREIA DO SUL", "KOREA", "SOUTH KOREA"],
        CZE: ["TCHEQUIA", "CHEQUIA", "CZECHIA"],
        CAN: ["CANADA"],
        BIH: ["BOSNIA", "BOSNIA E HERZEGOVINA"],
        QAT: ["CATAR", "QATAR"],
        SUI: ["SUICA", "SWITZERLAND"],
        BRA: ["BRASIL", "BRAZIL"],
        MAR: ["MARROCOS", "MOROCCO"],
        HAI: ["HAITI"],
        SCO: ["ESCOCIA", "SCOTLAND"],
        USA: ["ESTADOS UNIDOS", "UNITED STATES", "EUA"],
        PAR: ["PARAGUAI", "PARAGUAY"],
        AUS: ["AUSTRALIA"],
        TUR: ["TURQUIA", "TURKEY"],
        GER: ["ALEMANHA", "GERMANY", "DEUTSCHLAND"],
        CUW: ["CURACAO"],
        CIV: ["COSTA DO MARFIM", "COTE DIVOIRE", "IVORY COAST"],
        ECU: ["EQUADOR", "ECUADOR"],
        NED: ["PAISES BAIXOS", "HOLANDA", "NETHERLANDS"],
        JPN: ["JAPAO", "JAPAN"],
        SWE: ["SUECIA", "SWEDEN"],
        TUN: ["TUNISIA"],
        BEL: ["BELGICA", "BELGIUM"],
        EGV: ["EGITO", "EGYPT"],
        IRN: ["IRAO", "IRAN"],
        NZL: ["NOVA ZELANDIA", "NEW ZEALAND"],
        ESP: ["ESPANHA", "SPAIN"],
        CPV: ["CABO VERDE", "CAPE VERDE"],
        KSA: ["ARABIA SAUDITA", "SAUDI ARABIA"],
        URU: ["URUGUAI", "URUGUAY"],
        FRA: ["FRANCA", "FRANCE"],
        SEN: ["SENEGAL"],
        IRQ: ["IRAQUE", "IRAQ"],
        NOR: ["NORUEGA", "NORWAY"],
        ARG: ["ARGENTINA"],
        ALG: ["ARGELIA", "ALGERIA"],
        AUT: ["AUSTRIA"],
        JOR: ["JORDANIA", "JORDAN"],
        POR: ["PORTUGAL"],
        COD: ["CONGO", "REP DEM DO CONGO", "REP DEMOCRATICA DO CONGO", "DR CONGO"],
        UZB: ["UZBEQUISTAO", "UZBEKISTAN"],
        COL: ["COLOMBIA"],
        ENG: ["INGLATERRA", "ENGLAND"],
        CRO: ["CROACIA", "CROATIA"],
        GHA: ["GANA", "GHANA"],
        PAN: ["PANAMA"]
      };

      Object.entries(manualAliases).forEach(([code, names]) => {
        addAlias(code, code);
        names.forEach(name => addAlias(name, code));
      });

      Object.entries(COUNTRY_NAMES || {}).forEach(([code, name]) => {
        addAlias(code, code);
        addAlias(name, code);
      });

      stickers.forEach(sticker => {
        const code = exportGroupLabel(sticker.pais);
        const country = String(sticker.pais || "").trim();
        const withoutCode = country.replace(/^[A-Z0-9]{2,4}\s*[-\u2013\u2014]?\s*/i, "").trim();
        [code, country, withoutCode].forEach(alias => addAlias(alias, code));
      });
      return aliases;
    }
    function listStickerLookup() {
      const lookup = new Map();
      stickers.forEach(sticker => {
        const code = normalizeListLabel(exportGroupLabel(sticker.pais));
        lookup.set(`${code}|${stickerExportNumber(sticker)}`, sticker);
      });
      return lookup;
    }

    function sortedListAliases(aliases) {
      return [...aliases.entries()].sort((a, b) => b[0].length - a[0].length);
    }

    function looksLikeListHeader(line) {
      const normalized = normalizeListLabel(line);
      return /^(CROMOS|LISTA|TOTAL|FALTAM|FALTA|REPETIDOS|REPETIDO|OBTIDOS|OBTIDO)/.test(normalized);
    }

    function findCountryCodeInListLine(line, aliases) {
      const normalizedLine = normalizeListLabel(line);
      if (!normalizedLine) return "";

      const directLabel = normalizeListLabel(String(line).split(/[:;|=]/)[0]);
      for (const [alias, code] of sortedListAliases(aliases)) {
        if (directLabel === alias) return code;
        if (directLabel.startsWith(alias) && !/[A-Z]/.test(directLabel.charAt(alias.length) || "")) return code;
      }

      if (looksLikeListHeader(line)) return "";

      for (const [alias, code] of sortedListAliases(aliases)) {
        const index = normalizedLine.indexOf(alias);
        if (index < 0) continue;
        const before = normalizedLine.charAt(index - 1) || "";
        const after = normalizedLine.charAt(index + alias.length) || "";
        const cleanBefore = !before || !/[A-Z]/.test(before);
        const cleanAfter = !after || !/[A-Z]/.test(after);
        if (cleanBefore && cleanAfter) return code;
      }

      return "";
    }

    function listLineNumberText(line) {
      const afterSeparator = String(line).split(/[:;|=]/).slice(1).join(" ").trim();
      if (afterSeparator) return afterSeparator;
      const firstNumber = String(line).search(/\b00\b|\d/);
      return firstNumber >= 0 ? String(line).slice(firstNumber) : "";
    }

    function listNumberItems(value) {
      const items = [];
      const matcher = /(00|\d{1,3})(?:\s*(?:-|\u2013|\u2014|a|ate|até)\s*(\d{1,3}))?(?:\s*\(\s*x?\s*(\d+)\s*\))?/gi;
      let match;
      while ((match = matcher.exec(String(value || ""))) !== null) {
        const start = match[1].toUpperCase() === "00" ? 0 : Number(match[1]);
        const end = match[2] ? Number(match[2]) : start;
        const count = Math.max(1, Number(match[3] || 1));

        if (match[1].toUpperCase() === "00") {
          items.push({ number: "00", count });
          continue;
        }

        if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
        const rangeSize = Math.abs(end - start) + 1;
        if (match[2] && rangeSize <= 30) {
          const step = start <= end ? 1 : -1;
          for (let value = start; value !== end + step; value += step) {
            items.push({ number: String(value), count });
          }
        } else {
          items.push({ number: String(start), count });
        }
      }
      return items;
    }

    function addParsedListEntry(entries, sticker, count) {
      const current = entries.get(sticker.id) || { sticker, count: 0 };
      current.count += count;
      entries.set(sticker.id, current);
    }

    function expandPastedListLines(text) {
      const rawLines = String(text || "").split(/\r?\n/);
      const codes = [...new Set(stickers.map(sticker => exportGroupLabel(sticker.pais)).filter(Boolean))]
        .sort((a, b) => b.length - a.length);
      if (!codes.length) return rawLines;

      const escapedCodes = codes.map(code => code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const codePattern = new RegExp("\\b(" + escapedCodes.join("|") + ")\\b", "gi");

      return rawLines.flatMap(line => {
        const matches = [...line.matchAll(codePattern)];
        if (matches.length <= 1) return [line];
        return matches
          .map((match, index) => line.slice(match.index, matches[index + 1]?.index ?? line.length).trim())
          .filter(Boolean);
      });
    }

    function parsePastedStickerList(text) {

      const aliases = listCountryAliases();
      const lookup = listStickerLookup();
      const entries = new Map();
      const unknown = [];
      let totalItems = 0;

      expandPastedListLines(text).forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        const code = findCountryCodeInListLine(cleanLine, aliases);
        if (!code) return;

        const numberItems = listNumberItems(listLineNumberText(cleanLine));
        if (!numberItems.length) return;

        let foundInLine = false;
        numberItems.forEach(item => {
          const sticker = lookup.get(`${normalizeListLabel(code)}|${item.number}`);
          if (!sticker) {
            unknown.push(`${code} ${item.number}`);
            return;
          }
          addParsedListEntry(entries, sticker, item.count);
          totalItems += item.count;
          foundInLine = true;
        });

        if (!foundInLine) unknown.push(cleanLine);
      });

      return { entries: [...entries.values()], unknown: [...new Set(unknown)], totalItems };
    }
    function groupedListFromEntries(entries, formatter) {
      const byId = new Map(entries.map(entry => [entry.sticker.id, entry]));
      return allCountriesForAlbum(stickers)
        .map(country => {
          const values = stickers
            .filter(sticker => sticker.pais === country && byId.has(sticker.id))
            .sort((a, b) => stickerNumber(a) - stickerNumber(b))
            .map(sticker => formatter(byId.get(sticker.id)));
          if (!values.length) return "";
          return `${exportGroupLabel(country)}: ${values.join(", ")}`;
        })
        .filter(Boolean);
    }

    function formatCountedSticker(entry, count = entry.count) {
      const number = stickerExportNumber(entry.sticker);
      return count > 1 ? `${number} (${count})` : number;
    }

    function renderGroupedEntries(entries, emptyText, formatter = formatCountedSticker) {
      const lines = groupedListFromEntries(entries, formatter);
      if (!lines.length) return `<div class="comparison-empty">${escapeHTML(emptyText)}</div>`;
      return `<div class="comparison-lines">${lines.map(escapeHTML).join("<br>")}</div>`;
    }

    async function renderListComparison() {
      if (!listCompareResult) return;
      const mode = LIST_COMPARE_MODE_COPY[listCompareMode] ? listCompareMode : "duplicates";
      compareDuplicatesTab?.classList.toggle("active", mode === "duplicates");
      compareMissingTab?.classList.toggle("active", mode === "missing");
      compareDuplicatesTab?.setAttribute("aria-selected", String(mode === "duplicates"));
      compareMissingTab?.setAttribute("aria-selected", String(mode === "missing"));
      renderFriendListUserOptions();

      const text = listCompareInput?.value || "";
      if (!text.trim()) {
        listCompareResult.innerHTML = `
          <article class="list-compare-card" style="grid-column:1/-1">
            <h2>Cola uma lista para comparar</h2>
            <small>${escapeHTML(LIST_COMPARE_MODE_COPY[mode].helpText)}</small>
          </article>
        `;
        return;
      }

      const selectedProfile = friendListUserSelect?.value || "__me";
      listCompareResult.innerHTML = `<article class="list-compare-card" style="grid-column:1/-1"><h2>A comparar lista...</h2><small>A verificar a caderneta escolhida.</small></article>`;

      try {
        const parsed = parsePastedStickerList(text);
        const target = await targetAlbumForListUser(selectedProfile);
        const targetById = new Map(target.album.map(sticker => [sticker.id, sticker]));
        const matches = mode === "duplicates"
          ? parsed.entries
              .map(entry => ({ ...entry, count: 1 }))
              .filter(entry => {
                const targetSticker = targetById.get(entry.sticker.id);
                return targetSticker && !targetSticker.tenho;
              })
          : parsed.entries
              .map(entry => {
                const targetSticker = targetById.get(entry.sticker.id);
                const available = targetSticker ? availableDuplicates(targetSticker) : 0;
                return { ...entry, count: Math.min(Math.max(1, entry.count || 1), available) };
              })
              .filter(entry => entry.count > 0);
        const totalCopies = matches.reduce((sum, entry) => sum + Math.max(1, entry.count || 1), 0);
        const formatter = entry => formatCountedSticker(entry, entry.count);
        const unknownList = parsed.unknown.slice(0, 10);
        const targetName = target.profile || "a caderneta escolhida";
        const emptyText = mode === "duplicates"
          ? `${targetName} nao precisa de nenhum cromo dessa lista.`
          : `${targetName} nao tem repetidos livres para essa lista.`;

        listCompareResult.innerHTML = `
          <article class="list-compare-card">
            <h2>${escapeHTML(LIST_COMPARE_MODE_COPY[mode].resultTitle)} (${totalCopies})</h2>
            <small>Comparado com ${escapeHTML(targetName)}.</small>
            ${renderGroupedEntries(matches, emptyText, formatter)}
          </article>
          <article class="list-compare-card">
            <h2>Leitura da lista</h2>
            <div class="list-compare-meta">
              <span class="list-compare-pill">${parsed.entries.length} cromos lidos</span>
              <span class="list-compare-pill">${parsed.totalItems} no total</span>
              <span class="list-compare-pill">${totalCopies} encontrados</span>
            </div>
            ${unknownList.length ? `<small>Nao consegui reconhecer: ${escapeHTML(unknownList.join(", "))}${parsed.unknown.length > unknownList.length ? "..." : ""}</small>` : `<small>Lista lida com sucesso.</small>`}
          </article>
        `;
      } catch (error) {
        console.error("Erro ao comparar lista", error);
        listCompareResult.innerHTML = `<article class="list-compare-card" style="grid-column:1/-1"><h2>Nao foi possivel comparar</h2><small>Confirma a sessao online e tenta novamente.</small></article>`;
      }
    }
    function setListCompareMode(mode) {
      listCompareMode = LIST_COMPARE_MODE_COPY[mode] ? mode : "duplicates";
      renderListComparison();
    }

    function clearListComparison() {
      if (listCompareInput) listCompareInput.value = "";
      renderListComparison();
      listCompareInput?.focus();
    }

    function bulkAddAnalysis() {
      const parsed = parsePastedStickerList(bulkAddInput?.value || "");
      const newOwned = [];
      const addedDuplicates = [];
      let newOwnedCount = 0;
      let duplicateCopies = 0;

      parsed.entries.forEach(entry => {
        const sticker = stickers.find(item => item.id === entry.sticker.id) || entry.sticker;
        const count = Math.max(1, Number(entry.count || 1));
        if (!sticker.tenho) {
          newOwned.push({ sticker, count });
          newOwnedCount += 1;
          if (count > 1) {
            addedDuplicates.push({ sticker, count: count - 1 });
            duplicateCopies += count - 1;
          }
        } else {
          addedDuplicates.push({ sticker, count });
          duplicateCopies += count;
        }
      });

      return { parsed, newOwned, addedDuplicates, newOwnedCount, duplicateCopies };
    }

    function renderBulkAddPreview(message = "") {
      if (!bulkAddResult) return;
      const text = bulkAddInput?.value || "";
      if (!text.trim()) {
        bulkAddResult.innerHTML = `
          <article class="list-compare-card" style="grid-column:1/-1">
            <h2>Cola uma lista para adicionar</h2>
            <small>Quando aplicares, os cromos que ainda faltam ficam obtidos. Os que ja tens somam aos repetidos.</small>
          </article>
        `;
        return;
      }

      const analysis = bulkAddAnalysis();
      const unknownList = analysis.parsed.unknown.slice(0, 10);
      bulkAddResult.innerHTML = `
        <article class="list-compare-card">
          <h2>${message ? escapeHTML(message) : "Pre-visualizacao"}</h2>
          <div class="list-compare-meta">
            <span class="list-compare-pill">${analysis.parsed.entries.length} cromos lidos</span>
            <span class="list-compare-pill">${analysis.newOwnedCount} novos</span>
            <span class="list-compare-pill">${analysis.duplicateCopies} repetidos</span>
          </div>
          <small>Novos obtidos</small>
          ${renderGroupedEntries(analysis.newOwned, "Nao ha cromos novos nesta lista.")}
        </article>
        <article class="list-compare-card">
          <h2>Repetidos a somar</h2>
          ${renderGroupedEntries(analysis.addedDuplicates, "Nao ha repetidos para somar.")}
          ${unknownList.length ? `<small>Nao consegui reconhecer: ${escapeHTML(unknownList.join(", "))}${analysis.parsed.unknown.length > unknownList.length ? "..." : ""}</small>` : `<small>Lista lida com sucesso.</small>`}
        </article>
      `;
    }

    function applyBulkAddList() {
      if (!bulkAddInput?.value.trim()) {
        renderBulkAddPreview();
        return;
      }

      const analysis = bulkAddAnalysis();
      if (!analysis.parsed.entries.length) {
        renderBulkAddPreview("Nenhum cromo reconhecido");
        setSaveStatus("Nenhum cromo reconhecido na lista");
        return;
      }

      pushUndoState("Lista adicionada");
      analysis.parsed.entries.forEach(entry => {
        const sticker = stickers.find(item => item.id === entry.sticker.id) || entry.sticker;
        const count = Math.max(1, Number(entry.count || 1));
        const currentDuplicates = normalizeDuplicates(sticker.repetidos);
        if (!sticker.tenho) {
          sticker.tenho = true;
          sticker.rececoesPendentes = incomingReservations(sticker).map(item => ({ ...item, asDuplicate: true }));
          syncIncomingReservationLegacy(sticker);
          sticker.repetidos = currentDuplicates + Math.max(0, count - 1);
        } else {
          sticker.repetidos = currentDuplicates + count;
        }
      });

      saveState();
      recordHistory(`Lista adicionada: ${analysis.newOwnedCount} novos, ${analysis.duplicateCopies} repetidos`, { type: "sticker", action: "bulk_add", stickers: analysis.parsed.entries.map(entry => entry.sticker) });
      render();
      if (bulkAddResult) {
        const unknownList = analysis.parsed.unknown.slice(0, 10);
        bulkAddResult.innerHTML = `
          <article class="list-compare-card">
            <h2>Adicionados ${analysis.newOwnedCount} novos e ${analysis.duplicateCopies} repetidos</h2>
            <div class="list-compare-meta">
              <span class="list-compare-pill">${analysis.parsed.entries.length} cromos lidos</span>
              <span class="list-compare-pill">${analysis.newOwnedCount} novos</span>
              <span class="list-compare-pill">${analysis.duplicateCopies} repetidos</span>
            </div>
            <small>Novos obtidos</small>
            ${renderGroupedEntries(analysis.newOwned, "Nao foram adicionados cromos novos.")}
          </article>
          <article class="list-compare-card">
            <h2>Repetidos somados</h2>
            ${renderGroupedEntries(analysis.addedDuplicates, "Nao foram somados repetidos.")}
            ${unknownList.length ? `<small>Nao consegui reconhecer: ${escapeHTML(unknownList.join(", "))}${analysis.parsed.unknown.length > unknownList.length ? "..." : ""}</small>` : `<small>Lista aplicada com sucesso.</small>`}
          </article>
        `;
      }
      setSaveStatus(`Lista adicionada: ${analysis.newOwnedCount} novos, ${analysis.duplicateCopies} repetidos`);
    }

    function clearBulkAddList() {
      if (bulkAddInput) bulkAddInput.value = "";
      renderBulkAddPreview();
      bulkAddInput?.focus();
    }
    function renderFriendListUserOptions() {
      if (!friendListUserSelect) return;
      const selected = friendListUserSelect.value || "__me";
      const options = [
        `<option value="__me">${escapeHTML(liveProfile ? `${liveProfile} (tu)` : "A tua caderneta")}</option>`,
        ...liveProfilesList.map(item => `<option value="${escapeHTML(item.profile)}">${escapeHTML(item.profile)}</option>`)
      ];
      friendListUserSelect.innerHTML = options.join("");
      friendListUserSelect.value = options.some(option => option.includes(`value="${escapeHTML(selected)}"`)) ? selected : "__me";
    }

    function renderFriendListIntro() {
      if (!friendListResult) return;
      friendListResult.innerHTML = `
        <article class="list-compare-card" style="grid-column:1/-1">
          <h2>Cola uma lista de faltas</h2>
          <small>Escolhe um user e a app mostra que repetidos livres esse user consegue dar para essa lista.</small>
        </article>
      `;
    }

    async function targetAlbumForListUser(value) {
      if (!value || value === "__me") return { profile: liveProfile || "a tua caderneta", album: stickers };
      const data = await fetchFriendAlbumCached(value);
      return { profile: value, album: data.stickers || [] };
    }

    async function renderFriendListComparison() {
      if (!friendListResult) return;
      const text = friendListInput?.value || "";
      renderFriendListUserOptions();
      if (!text.trim()) {
        renderFriendListIntro();
        return;
      }

      const selectedProfile = friendListUserSelect?.value || "__me";
      friendListResult.innerHTML = `<article class="list-compare-card" style="grid-column:1/-1"><h2>A verificar lista...</h2><small>A procurar repetidos livres no user escolhido.</small></article>`;

      try {
        const parsed = parsePastedStickerList(text);
        const target = await targetAlbumForListUser(selectedProfile);
        const byId = new Map(target.album.map(sticker => [sticker.id, sticker]));
        const matches = parsed.entries
          .map(entry => {
            const targetSticker = byId.get(entry.sticker.id);
            const available = targetSticker ? availableDuplicates(targetSticker) : 0;
            return { ...entry, count: Math.min(Math.max(1, entry.count || 1), available) };
          })
          .filter(entry => entry.count > 0);
        const totalCopies = matches.reduce((sum, entry) => sum + entry.count, 0);
        const unknownList = parsed.unknown.slice(0, 10);

        friendListResult.innerHTML = `
          <article class="list-compare-card">
            <h2>${escapeHTML(target.profile)} consegue dar (${totalCopies})</h2>
            <small>Comparado com os repetidos livres do user escolhido.</small>
            ${renderGroupedEntries(matches, `${target.profile} nao tem repetidos livres dessa lista.`)}
          </article>
          <article class="list-compare-card">
            <h2>Leitura da lista</h2>
            <div class="list-compare-meta">
              <span class="list-compare-pill">${parsed.entries.length} cromos lidos</span>
              <span class="list-compare-pill">${parsed.totalItems} no total</span>
              <span class="list-compare-pill">${totalCopies} disponiveis</span>
            </div>
            ${unknownList.length ? `<small>Nao consegui reconhecer: ${escapeHTML(unknownList.join(", "))}${parsed.unknown.length > unknownList.length ? "..." : ""}</small>` : `<small>Lista lida com sucesso.</small>`}
          </article>
        `;
      } catch (error) {
        console.error("Erro ao comparar lista por user", error);
        friendListResult.innerHTML = `<article class="list-compare-card" style="grid-column:1/-1"><h2>Nao foi possivel verificar</h2><small>Confirma se tens sessao online e tenta novamente.</small></article>`;
      }
    }

    function clearFriendListComparison() {
      if (friendListInput) friendListInput.value = "";
      renderFriendListIntro();
      friendListInput?.focus();
    }


    function stickerShortLabel(sticker) {
      return `${exportGroupLabel(sticker.pais)} ${stickerExportNumber(sticker)}`;
    }

    function albumSnapshot() {
      return stickers.map(sticker => ({
        id: sticker.id,
        tenho: Boolean(sticker.tenho),
        repetidos: normalizeDuplicates(sticker.repetidos),
        reservados: reservedDuplicates(sticker),
        reservas: normalizeReservations(sticker.reservas),
        pendenteReceber: isPendingIncoming(sticker),
        pendenteDe: normalizePendingPerson(sticker.pendenteDe),
        pendenteDesde: isPendingIncoming(sticker) ? String(sticker.pendenteDesde || "") : "",
        pendenteTrocaId: isPendingIncoming(sticker) ? String(sticker.pendenteTrocaId || "") : "",
        pendenteComoRepetido: isPendingIncoming(sticker) && normalizePendingDuplicate(sticker.pendenteComoRepetido),
        rececoesPendentes: incomingReservations(sticker)
      }));
    }

    function restoreAlbumSnapshot(snapshot) {
      const byId = new Map((snapshot || []).map(item => [item.id, item]));
      stickers.forEach(sticker => {
        const saved = byId.get(sticker.id);
        if (!saved) return;
        sticker.tenho = Boolean(saved.tenho);
        sticker.repetidos = normalizeDuplicates(saved.repetidos);
        sticker.reservas = normalizeReservations(saved.reservas);
        sticker.pendenteReceber = normalizePendingIncoming(saved.pendenteReceber);
        sticker.pendenteDe = normalizePendingPerson(saved.pendenteDe);
        sticker.pendenteDesde = String(saved.pendenteDesde || "").slice(0, 40);
        sticker.pendenteTrocaId = String(saved.pendenteTrocaId || "").trim().slice(0, 80);
        sticker.pendenteComoRepetido = normalizePendingDuplicate(saved.pendenteComoRepetido);
        sticker.rececoesPendentes = normalizeIncomingReservations(saved.rececoesPendentes, saved);
        syncIncomingReservationLegacy(sticker);
        sticker.reservados = Array.isArray(saved.reservas) && saved.reservas.length
          ? reservationTotal(sticker)
          : Math.min(normalizeReserved(saved.reservados), sticker.repetidos);
        syncStickerReservations(sticker);
      });
      saveState();
      render();
    }
    function hideUndoBar() {
      const bar = document.getElementById("undoBar");
      if (bar) bar.remove();
      if (undoTimer) clearTimeout(undoTimer);
      undoTimer = null;
    }

    function showUndoBar(label) {
      hideUndoBar();
      const bar = document.createElement("div");
      bar.id = "undoBar";
      bar.className = "undo-bar";
      bar.setAttribute("role", "status");
      bar.innerHTML = `<span>${escapeHTML(label)}</span><button type="button" onclick="undoLastAlbumAction()">Desfazer</button>`;
      document.body.appendChild(bar);
      undoTimer = setTimeout(hideUndoBar, 5200);
    }

    function pushUndoState(label) {
      if (isFriendView()) return;
      undoState = { snapshot: albumSnapshot(), label, time: Date.now() };
      showUndoBar(label || "Alteracao feita");
    }

    function undoLastAlbumAction() {
      if (!undoState) return;
      const label = undoState.label || "Alteracao";
      restoreAlbumSnapshot(undoState.snapshot);
      recordHistory(`Desfeito: ${label}`);
      undoState = null;
      hideUndoBar();
      setSaveStatus("Alteracao desfeita");
    }

    async function clearWholeAlbum() {
      if (isFriendView()) {
        setSaveStatus(`Estas a ver a caderneta de ${friendProfile}`);
        return;
      }
      if (!requireLiveLogin()) return;
      if (!stickers.length) {
        setSaveStatus("Nao ha cromos para limpar");
        return;
      }

      const confirmed = confirm("Tens a certeza que queres limpar a caderneta toda? Isto vai remover obtidos, repetidos, guardados e cromos pendentes.");
      if (!confirmed) return;

      const totals = stickerStatsFor(stickers);
      const duplicateTotal = stickers.reduce((sum, sticker) => sum + normalizeDuplicates(sticker.repetidos), 0);
      const reservedTotal = stickers.reduce((sum, sticker) => sum + reservedDuplicates(sticker), 0);
      pushUndoState("Caderneta limpa");

      stickers.forEach(sticker => {
        sticker.tenho = false;
        sticker.repetidos = 0;
        sticker.reservados = 0;
        sticker.reservas = [];
        syncStickerReservations(sticker);
        sticker.pendenteReceber = false;
        sticker.pendenteDe = "";
        sticker.pendenteDesde = "";
        sticker.pendenteTrocaId = "";
        sticker.pendenteComoRepetido = false;
        sticker.rececoesPendentes = [];
        syncIncomingReservationLegacy(sticker);
      });

      selectedView = "all";
      currentSearch = "";
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.value = "";

      saveState();
      recordHistory(`Caderneta limpa: ${totals.owned} obtidos, ${duplicateTotal} repetidos e ${reservedTotal} guardados removidos`, {
        type: "album",
        action: "clear_album"
      });
      render();

      const message = document.getElementById("settingsClearAlbumMessage");
      if (message) message.textContent = "Caderneta limpa com sucesso.";
      try {
        await persistStateNow();
        setSaveStatus("Caderneta limpa e sincronizada");
      } catch (error) {
        console.error(error);
        setSaveStatus("Caderneta limpa, mas houve erro ao sincronizar");
        if (message) message.textContent = "Caderneta limpa, mas houve erro ao sincronizar.";
      }
    }

    function historyStorageKey() {
      return `${HISTORY_KEY}_${liveProfile || "local"}`;
    }

    function readHistoryLog() {
      try {
        const data = JSON.parse(localStorage.getItem(historyStorageKey()) || "[]");
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    }

    function writeHistoryLog(items) {
      try {
        localStorage.setItem(historyStorageKey(), JSON.stringify(items.slice(0, 120)));
      } catch {}
    }

    function historyClientId() {
      return "hist_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    }

    function historyStickerPayload(sticker) {
      return {
        id: String(sticker?.id || ""),
        pais: String(sticker?.pais || ""),
        codigo: String(sticker?.codigo || ""),
        nome: String(sticker?.nome || "")
      };
    }

    function historyStickerListPayload(list) {
      return (Array.isArray(list) ? list : []).map(historyStickerPayload).filter(sticker => sticker.id || sticker.codigo || sticker.nome);
    }

    async function persistHistoryLog(item) {
      if (!liveEnabled || !liveProfile) return;
      try {
        const response = await apiFetch("/api/live/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.log) {
          liveHistoryLogs = [data.log, ...liveHistoryLogs.filter(log => log.clientId !== data.log.clientId && log.id !== data.log.id)].slice(0, 250);
          if (activePage === "history") renderHistoryPanel();
        }
      } catch {}
    }

    function recordHistory(text, options = {}) {
      if (!text) return;
      const item = {
        clientId: historyClientId(),
        text,
        at: new Date().toISOString(),
        type: options.type || "sticker",
        action: options.action || "sticker_update",
        stickers: historyStickerListPayload(options.stickers),
        given: historyStickerListPayload(options.given),
        received: historyStickerListPayload(options.received),
        partner: options.partner || "",
        tradeId: options.tradeId || "",
        source: "local"
      };
      const items = readHistoryLog();
      items.unshift(item);
      writeHistoryLog(items);
      persistHistoryLog(item);
      if (activePage === "history") renderHistoryPanel();
      if (activePage === "notifications") renderNotificationsPanel();
    }

    async function loadHistoryLogs() {
      if (!liveEnabled || !liveProfile) {
        liveHistoryLogs = [];
        return [];
      }
      const response = await apiFetch("/api/live/history", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nao foi poss\u00edvel carregar historico");
      liveHistoryLogs = Array.isArray(data.history) ? data.history : [];
      return liveHistoryLogs;
    }

    function historyTimeLabel(value) {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return "Agora";
      return date.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    }

    function historyDayLabel(value) {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return "Sem data";
      return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
    }

    function historyHourLabel(value) {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return "--:--";
      return date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    }

    function historyBaselineItems() {
      const album = stickers || [];
      if (!album.length || readHistoryLog().length || liveHistoryLogs.length) return [];

      const owned = album.filter(sticker => sticker.tenho);
      const repeated = album.filter(sticker => normalizeDuplicates(sticker.repetidos) > 0);
      const duplicateCopies = repeated.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      if (!owned.length && !duplicateCopies) return [];

      return [{
        text: "Historico detalhado comeca a partir desta versao. Antes disso so existia o estado atual da caderneta.",
        at: liveUpdatedAt || "",
        timeLabel: liveUpdatedAt ? "Ultima atualizacao antiga: " + historyTimeLabel(liveUpdatedAt) : "Sem data antiga detalhada",
        detail: owned.length + " cromos obtidos e " + duplicateCopies + " repetidos ja existiam antes dos logs."
      }];
    }

    function tradeHistoryAt(trade) {
      return trade.acceptedAt || trade.rejectedAt || trade.cancelledAt || trade.updatedAt || trade.createdAt || new Date().toISOString();
    }

    function tradeHistoryText(trade) {
      const partner = tradePartnerName(trade);
      if (trade.status === "accepted") return "Troca aceite com " + partner + ": " + tradeReceivedPreview(trade);
      if (trade.status === "rejected") return "Troca recusada com " + partner + ": " + tradeReceivedPreview(trade);
      if (trade.status === "cancelled") return "Troca cancelada com " + partner + ": " + tradeReceivedPreview(trade);
      return trade.direction === "incoming" ? partner + " propos uma troca" : "Proposta enviada a " + partner;
    }

    function tradeHistoryItems() {
      const loggedTradeIds = new Set(liveHistoryLogs.map(log => log.tradeId).filter(Boolean));
      return (tradeRequests || [])
        .filter(trade => trade.status !== "pending" && !loggedTradeIds.has(trade.id))
        .map(trade => ({
          text: tradeHistoryText(trade),
          at: tradeHistoryAt(trade),
          source: "trade-fallback",
          detail: "Tu das:<br>" + tradeStickerList(trade.give || []) + "<br><br>Tu recebes:<br>" + tradeStickerList(trade.receive || [])
        }));
    }

    function normalizeHistoryItem(item, source = "") {
      const at = item.at || item.createdAt || "";
      return {
        id: item.id || "",
        clientId: item.clientId || "",
        text: item.text || "",
        at,
        timeLabel: item.timeLabel || "",
        detail: item.detail || "",
        stickers: item.stickers || [],
        given: item.given || [],
        received: item.received || [],
        source: item.source || source,
        type: item.type || "",
        action: item.action || "",
        tradeId: item.tradeId || ""
      };
    }

    function historyStickerDetail(item) {
      if (item.detail) return item.detail;
      if (item.received?.length || item.given?.length) {
        return "Recebeste:<br>" + tradeStickerList(item.received || []) + "<br><br>Deste:<br>" + tradeStickerList(item.given || []);
      }
      if (item.stickers?.length) return "Cromos:<br>" + tradeStickerList(item.stickers);
      return "";
    }


    function historyActionText(item) {
      const text = String(item.text || "");
      const colon = text.indexOf(":");
      if (colon > 0 && colon < 80) return text.slice(0, colon).trim();
      if (item.action === "bulk_add") return "Lista adicionada";
      if (item.action === "duplicate_add") return "Cromo repetido colocado";
      if (item.action === "duplicate_remove") return "Cromo repetido retirado";
      if (item.action === "sticker_owned") return "Cromo colado";
      if (item.action === "sticker_removed") return "Cromo descolado";
      return text || "Alteracao";
    }

    function historyMinuteKey(item) {
      const date = new Date(item.at || 0);
      if (!Number.isFinite(date.getTime())) return item.timeLabel || "sem-data";
      date.setSeconds(0, 0);
      return date.toISOString();
    }

    function historyCountryKey(item) {
      const sticker = (item.stickers || item.received || item.given || [])[0] || {};
      return exportGroupLabel(sticker.pais || "") || sticker.pais || "ZZZ";
    }

    function historyStickerSummary(items) {
      const grouped = new Map();
      items.flatMap(item => item.stickers || []).forEach(sticker => {
        const country = exportGroupLabel(sticker.pais || "") || sticker.pais || "CROMO";
        const number = stickerExportNumber(sticker);
        if (!grouped.has(country)) grouped.set(country, []);
        grouped.get(country).push(number);
      });
      return [...grouped.entries()].map(([country, nums]) => `${country}: ${[...new Set(nums)].join(", ")}`).join(" / ");
    }

    function sortHistoryItems(items) {
      const sort = historySortSelect?.value || "newest";
      const time = item => new Date(item.at || 0).getTime() || 0;
      const sorted = items.slice();
      if (sort === "oldest") return sorted.sort((a, b) => time(a) - time(b));
      if (sort === "action") return sorted.sort((a, b) => historyActionText(a).localeCompare(historyActionText(b), "pt-PT") || time(b) - time(a));
      if (sort === "country") return sorted.sort((a, b) => historyCountryKey(a).localeCompare(historyCountryKey(b), "pt-PT") || time(b) - time(a));
      return sorted.sort((a, b) => time(b) - time(a));
    }

    function openTextDetailModal(title, text) {
      if (!tradeModal || !tradeModalBody) return alert(text);
      tradeModalOpen = true;
      tradeModal.classList.remove("hidden");
      tradeModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      tradeModalBody.innerHTML = `
        <div class="trade-modal-head">
          <div><h2>${escapeHTML(title)}</h2><p>Detalhe completo</p></div>
          <button class="trade-modal-close secondary" type="button" onclick="closeTradeModal()" aria-label="Fechar">x</button>
        </div>
        <article class="text-detail-modal-body">${escapeHTML(text).replace(/\n/g, "<br>")}</article>
      `;
    }

    function compactNotificationText(text, title = "Notificacao") {
      const value = String(text || "");
      if (value.length <= 120) return escapeHTML(value);
      return `${escapeHTML(value.slice(0, 120))}... <button class="inline-link-button" type="button" onclick="openTextDetailModal('${escapeJS(title)}', '${escapeJS(value)}')">Ver tudo</button>`;
    }
    function mergedHistoryItems() {
      const byKey = new Map();
      const add = item => {
        const normalized = normalizeHistoryItem(item);
        if (!normalized.text) return;
        const key = normalized.clientId || normalized.id || (normalized.text + "|" + normalized.at);
        if (!byKey.has(key)) byKey.set(key, normalized);
      };
      liveHistoryLogs.filter(item => item.action !== "trade_accepted" && !(item.type === "trade" && !String(item.action || "").startsWith("reserved_trade_"))).forEach(add);
      readHistoryLog().filter(item => item.action !== "trade_accepted" && !(item.type === "trade" && !String(item.action || "").startsWith("reserved_trade_"))).forEach(add);
      historyBaselineItems().forEach(add);
      return [...byKey.values()].sort((a, b) => {
        const aFixedLabel = a.timeLabel && !a.at;
        const bFixedLabel = b.timeLabel && !b.at;
        if (aFixedLabel && !bFixedLabel) return 1;
        if (!aFixedLabel && bFixedLabel) return -1;
        return new Date(b.at || 0) - new Date(a.at || 0);
      });
    }

    function historyItemTime(item) {
      return item.timeLabel || historyHourLabel(item.at);
    }

    function renderHistoryItem(item) {
      const detail = historyStickerDetail(item);
      return "<article class=\"history-line\">" +
        "<time>" + escapeHTML(historyItemTime(item)) + "</time>" +
        "<div class=\"history-line-body\"><strong>" + compactNotificationText(item.text, "Historico") + "</strong>" +
        (detail ? "<small>" + detail + "</small>" : "") +
        "</div></article>";
    }

    function renderHistoryLogGroup(items) {
      if (items.length === 1) return renderHistoryItem(items[0]);
      const first = items[0];
      const summary = historyStickerSummary(items);
      const text = summary ? `${historyActionText(first)}: ${summary}` : `${historyActionText(first)} (${items.length})`;
      return renderHistoryItem({ ...first, text, stickers: items.flatMap(item => item.stickers || []) });
    }

    function changeHistoryDay(delta) {
      historyDayIndex = Math.max(0, historyDayIndex + Number(delta || 0));
      renderHistoryPanel();
    }
    function renderHistoryPanel(message = "") {
      if (!historyResult) return;
      const query = normalizeSearch(historySearchInput?.value || "");
      const type = historyTypeSelect?.value || "all";
      const items = sortHistoryItems(mergedHistoryItems().filter(item => {
        const action = item.action || item.type || "";
        if (type !== "all") {
          if (type === "bulk_add" && action !== "bulk_add") return false;
          if (type !== "bulk_add" && item.type !== type && action !== type) return false;
        }
        if (!query) return true;
        const haystack = normalizeSearch([
          item.text,
          item.action,
          item.type,
          ...(item.stickers || []).map(sticker => `${sticker.pais || ""} ${sticker.codigo || ""} ${sticker.nome || ""}`),
          ...(item.given || []).map(sticker => `${sticker.pais || ""} ${sticker.codigo || ""} ${sticker.nome || ""}`),
          ...(item.received || []).map(sticker => `${sticker.pais || ""} ${sticker.codigo || ""} ${sticker.nome || ""}`)
        ].join(" "));
        return haystack.includes(query);
      }));

      if (!items.length) {
        historyDayIndex = 0;
        historyResult.innerHTML = "<div class=\"comparison-empty\">" + escapeHTML(message || "Ainda nao ha logs de cromos.") + "</div>";
        return;
      }

      const grouped = new Map();
      items.slice(0, 160).forEach(item => {
        const day = item.timeLabel && !item.at ? "Notas" : historyDayLabel(item.at);
        const minute = historyMinuteKey(item);
        const action = historyActionText(item);
        const key = `${day}|${minute}|${action}`;
        if (!grouped.has(day)) grouped.set(day, new Map());
        const dayMap = grouped.get(day);
        if (!dayMap.has(key)) dayMap.set(key, []);
        dayMap.get(key).push(item);
      });

      const days = [...grouped.entries()];
      historyDayIndex = Math.max(0, Math.min(historyDayIndex, days.length - 1));
      const [day, dayGroups] = days[historyDayIndex];
      const groups = [...dayGroups.values()];
      const total = groups.reduce((sum, group) => sum + group.length, 0);
      const hasOlder = historyDayIndex < days.length - 1;
      const hasNewer = historyDayIndex > 0;

      historyResult.innerHTML =
        (message ? "<div class=\"comparison-empty\">" + escapeHTML(message) + "</div>" : "") +
        "<div class=\"history-log history-log-paged\">" +
          "<section class=\"history-day\">" +
            "<div class=\"history-day-head history-day-head-paged\">" +
              "<button class=\"history-day-nav\" type=\"button\" onclick=\"changeHistoryDay(1)\" " + (hasOlder ? "" : "disabled") + " aria-label=\"Dia anterior\">&lt;</button>" +
              "<div class=\"history-day-current\"><h3>" + escapeHTML(day) + "</h3><span>" + total + " movimentos · " + (historyDayIndex + 1) + "/" + days.length + "</span></div>" +
              "<button class=\"history-day-nav\" type=\"button\" onclick=\"changeHistoryDay(-1)\" " + (hasNewer ? "" : "disabled") + " aria-label=\"Dia seguinte\">&gt;</button>" +
            "</div>" +
            "<div class=\"history-day-list\">" + groups.map(renderHistoryLogGroup).join("") + "</div>" +
          "</section>" +
        "</div>";
    }
    function clearHistoryLog() {
      writeHistoryLog([]);
      renderHistoryPanel();
      setSaveStatus("Historico local limpo");
    }

    function openHistoryPanel() {
      switchAppPage("history");
      renderHistoryPanel("A carregar logs antigos...");
      Promise.all([
        loadHistoryLogs().catch(() => {}),
        loadTradeRequests().catch(() => {})
      ]).finally(() => renderHistoryPanel());
    }

    function incomingPendingTrades() {
      return tradeRequests.filter(trade => trade.status === "pending" && trade.direction === "incoming");
    }

    function outgoingPendingTrades() {
      return tradeRequests.filter(trade => trade.status === "pending" && trade.direction !== "incoming");
    }

    function renderTopNotificationsPopover() {
      if (!topNotificationsPopover) return;
      const incoming = incomingPendingTrades().slice(0, 3);
      const activity = mergedHistoryItems().slice(0, 4);
      const items = [
        ...incoming.map(trade => ({
          title: `${tradePartnerName(trade)} propos uma troca`,
          detail: tradeReceivedPreview(trade),
          onclick: `openTradeDetail('${escapeJS(trade.id)}')`
        })),
        ...activity.map(item => ({
          title: item.text,
          detail: historyTimeLabel(item.at),
          onclick: `openTextDetailModal('Atividade', '${escapeJS(item.text)}')`
        }))
      ];
      topNotificationsPopover.innerHTML = `
        <div class="top-notifications-head"><strong>Notificacoes</strong><small>${items.length}</small></div>
        <div class="top-notifications-list">
          ${items.length ? items.map(item => `
            <button class="top-notification-item" type="button" onclick="${item.onclick}; closeTopNotifications()">
              <strong>${escapeHTML(item.title.length > 110 ? `${item.title.slice(0, 110)}...` : item.title)}</strong>
              <small>${escapeHTML(item.detail || "")}</small>
            </button>
          `).join("") : `<div class="comparison-empty">Nao tens notificacoes recentes.</div>`}
        </div>
        <div class="top-notifications-footer"><small>Atividade recente</small><button type="button" onclick="openNotificationsPanel(); closeTopNotifications()">Ver todas</button></div>
      `;
    }

    function closeTopNotifications() {
      topNotificationsPopover?.classList.add("hidden");
      topNotificationButton?.setAttribute("aria-expanded", "false");
    }

    function toggleTopNotifications(event) {
      event?.stopPropagation();
      if (!topNotificationsPopover) return openNotificationsPanel();
      const willOpen = topNotificationsPopover.classList.contains("hidden");
      closeUserMenu();
      if (!willOpen) return closeTopNotifications();
      renderTopNotificationsPopover();
      topNotificationsPopover.classList.remove("hidden");
      topNotificationButton?.setAttribute("aria-expanded", "true");
    }

    function updateTradeBadges() {
      const pending = tradeRequests.filter(trade => trade.status === "pending").length;
      const incoming = incomingPendingTrades().length;
      if (tradeMenuBadge) {
        tradeMenuBadge.textContent = pending;
        tradeMenuBadge.classList.toggle("hidden", pending <= 0);
      }
      if (notificationMenuBadge) {
        notificationMenuBadge.textContent = incoming;
        notificationMenuBadge.classList.toggle("hidden", incoming <= 0);
      }
      if (topNotificationBadge) {
        topNotificationBadge.textContent = incoming > 9 ? "9+" : incoming;
        topNotificationBadge.classList.toggle("hidden", incoming <= 0);
      }
      if (mobileTradeBadge) {
        mobileTradeBadge.textContent = pending > 9 ? "9+" : pending;
        mobileTradeBadge.classList.toggle("hidden", pending <= 0);
      }
      if (mobileNotificationBadge) {
        mobileNotificationBadge.textContent = incoming > 9 ? "9+" : incoming;
        mobileNotificationBadge.classList.toggle("hidden", incoming <= 0);
      }
    }

    function renderNotificationsPanel() {
      if (!notificationsResult) return;
      updateTradeBadges();
      const incoming = incomingPendingTrades();
      const outgoing = outgoingPendingTrades();
      const history = readHistoryLog().slice(0, 4);
      notificationsResult.innerHTML = `
        <div class="insight-grid">
          <article class="insight-card">
            <div class="insight-card-head"><strong>Propostas recebidas</strong><small>${incoming.length}</small></div>
            ${incoming.length ? renderTradeCards(incoming) : `<small>Nao tens propostas por responder.</small>`}
          </article>
          <article class="insight-card">
            <div class="insight-card-head"><strong>Propostas enviadas</strong><small>${outgoing.length}</small></div>
            ${outgoing.length ? renderTradeCards(outgoing) : `<small>Nao tens propostas pendentes enviadas.</small>`}
          </article>
          <article class="insight-card">
            <div class="insight-card-head"><strong>Atividade recente</strong><small>${history.length}</small></div>
            ${history.length ? history.map(item => `<small>${escapeHTML(historyTimeLabel(item.at))} - ${compactNotificationText(item.text, "Atividade recente")}</small>`).join("") : `<small>Sem atividade recente.</small>`}
          </article>
        </div>
      `;
    }

    function openNotificationsPanel() {
      switchAppPage("notifications");
      notificationsResult.innerHTML = `<div class="comparison-empty">A carregar notificacoes...</div>`;
      loadTradeRequests()
        .catch(() => {})
        .finally(renderNotificationsPanel);
    }

    function stickerStatsFor(album) {
      const total = album.length;
      const owned = album.filter(sticker => sticker.tenho).length;
      const missing = total - owned;
      const duplicates = album.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const percent = total ? Math.round((owned / total) * 100) : 0;
      return { total, owned, missing, duplicates, percent };
    }

    function compatibilityWithFriend(profile, album, userColor = DEFAULT_USER_COLOR) {
      const friendById = new Map(album.map(sticker => [sticker.id, sticker]));
      const mineById = new Map(stickers.map(sticker => [sticker.id, sticker]));
      const canGive = stickers.filter(sticker => {
        const friendSticker = friendById.get(sticker.id);
        return sticker.tenho && availableDuplicates(sticker) > 0 && friendSticker && !friendSticker.tenho;
      });
      const canReceive = album.filter(sticker => {
        const mine = mineById.get(sticker.id);
        return sticker.tenho && availableDuplicates(sticker) > 0 && mine && !mine.tenho;
      });
      const stats = stickerStatsFor(album);
      return {
        profile,
        userColor: sanitizeUserColor(userColor),
        canGive,
        canReceive,
        tradeSize: Math.min(canGive.length, canReceive.length),
        stats
      };
    }

    function currentUserRankingItem() {
      const item = compatibilityWithFriend(liveProfile || "Tu", stickers, currentUserColor || DEFAULT_USER_COLOR);
      item.profilePhoto = savedProfilePhoto();
      return item;
    }

    function rankingItemFromProfile(item) {
      const counts = item?.counts || {};
      const total = Number(counts.total || 0);
      const owned = Number(counts.owned || 0);
      const missing = Number(counts.missing || Math.max(0, total - owned));
      const duplicates = Number(counts.duplicates || 0);
      const percent = total ? Math.round((owned / total) * 100) : 0;
      return {
        profile: item.profile,
        userColor: sanitizeUserColor(item.userColor || profileColors[item.profile] || DEFAULT_USER_COLOR),
        canGive: [],
        canReceive: [],
        canGiveCount: 0,
        canReceiveCount: 0,
        compatibilityReady: false,
        tradeSize: 0,
        stats: { total, owned, missing, duplicates, percent },
        profilePhoto: item.profilePhoto || profilePhotos[item.profile] || "",
        updatedAt: item.updatedAt || ""
      };
    }

    function rankingItemsFromProfiles() {
      const previous = new Map((friendRankingItems || []).map(item => [item.profile, item]));
      return (liveProfilesList || []).filter(item => item?.profile).map(item => {
        const base = rankingItemFromProfile(item);
        const cached = previous.get(base.profile);
        return cached?.compatibilityReady ? {
          ...base,
          canGiveCount: cached.canGiveCount,
          canReceiveCount: cached.canReceiveCount,
          compatibilityReady: true
        } : base;
      });
    }


    function renderFriendInsights(items = null) {
      if (!friendInsights) return;
      if (Array.isArray(items)) friendRankingItems = items;
      const raw = Array.isArray(items) ? items : friendRankingItems;
      const byProfile = new Map();
      raw.forEach(item => { if (item?.profile) byProfile.set(item.profile, item); });
      if (liveProfile) byProfile.set(liveProfile, currentUserRankingItem());
      const list = [...byProfile.values()].sort((a, b) => b.stats.percent - a.stats.percent || b.stats.owned - a.stats.owned || a.profile.localeCompare(b.profile, "pt-PT"));
      if (!list.length) {
        friendInsights.innerHTML = `<div class="comparison-empty">Ainda nao ha ranking para mostrar.</div>`;
        return;
      }
      friendInsights.innerHTML = `
        <section class="friends-ranking-panel">
          <div class="friend-ranking-box">
            <div class="friend-ranking-title">
              <strong>Ranking da caderneta</strong>
              <span>${list.length} users</span>
            </div>
            <div class="friend-ranking-list">
              ${list.map((item, index) => {
                const isMe = liveProfile && item.profile === liveProfile;
                const active = friendProfile === item.profile || (!friendProfile && isMe);
                return `
                  <button class="friend-ranking-card ${active ? "active" : ""} ${isMe ? "is-me" : ""}" type="button" style="--friend-rank-color:${escapeHTML(isMe ? currentUserColor : item.userColor)};--friend-progress:${item.stats.percent}%" onclick="${isMe ? "showMyAlbum()" : `loadFriendAlbum('${escapeJS(item.profile)}', 'friends')`}">
                    <span class="friend-ranking-position">${index + 1}</span>
                    <span class="friend-ranking-main">
                      <strong>${escapeHTML(isMe ? `${item.profile} (tu)` : item.profile)}</strong>
                      <span class="friend-ranking-progress" aria-hidden="true"><i></i></span>
                      <small>${item.stats.owned}/${item.stats.total} obtidos - ${item.stats.percent}%</small>
                    </span>
                    <span class="friend-ranking-trades">
                      <span class="friend-ranking-percent"><b>${item.stats.percent}%</b>completa</span>
                      ${isMe
                        ? `<span><b>${item.stats.duplicates}</b>repetidos</span>`
                        : item.compatibilityReady
                          ? `<span><b>${item.canReceiveCount ?? item.canReceive.length}</b>tem para ti</span><span><b>${item.canGiveCount ?? item.canGive.length}</b>precisa teus</span>`
                          : `<span class="is-loading">A calcular trocas...</span>`}
                    </span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        </section>
        ${renderFriendNeededPanel()}
      `;
    }

    function renderFriendNeededPanel() {
      if (!hasSelectedFriend()) return "";
      const list = possibleTradeReceives();
      const totalCopies = duplicateCopyCount(list);
      const grouped = new Map();
      list.forEach(sticker => {
        if (!grouped.has(sticker.pais)) grouped.set(sticker.pais, []);
        grouped.get(sticker.pais).push(sticker);
      });
      const groups = [...grouped.entries()].sort((a, b) => albumCountries().indexOf(a[0]) - albumCountries().indexOf(b[0]));
      return `
        <section class="friend-needed-panel" style="--friend-rank-color:${escapeHTML(friendUserColor || DEFAULT_USER_COLOR)}">
          <div class="friend-needed-head">
            <strong>${escapeHTML(friendProfile)} tem para ti</strong>
            <span>${totalCopies} cromos disponiveis</span>
          </div>
          ${groups.length ? `
            <div class="friend-needed-list">
              ${groups.map(([country, stickersList]) => `
                <div class="friend-needed-group">
                  <span class="friend-needed-country">${escapeHTML(exportGroupLabel(country))}</span>
                  <div class="friend-needed-chips">
                    ${stickersList.map(sticker => {
                      const copies = availableDuplicates(sticker);
                      return `
                        <span class="friend-needed-chip" style="${nativeCountryCardStyle(sticker.pais)}">
                          <b>${escapeHTML(stickerShortLabel(sticker))}</b>
                          <small>${escapeHTML(sticker.nome)}</small>
                          ${copies > 1 ? `<em>x${copies}</em>` : ""}
                        </span>
                      `;
                    }).join("")}
                  </div>
                </div>
              `).join("")}
            </div>
          ` : `<div class="comparison-empty">${escapeHTML(friendProfile)} nao tem repetidos que te faltem neste momento.</div>`}
        </section>
      `;
    }

    function renderFriendTradePrompt() {
      if (!friendTradePrompt) return;
      if (!isFriendView()) {
        friendTradePrompt.innerHTML = "";
        return;
      }
      const gives = possibleTradeGivesFriendNeeds();
      const receives = possibleTradeReceives();
      const size = Math.min(gives.length, receives.length, 50);
      friendTradePrompt.innerHTML = `
        <div>
          <strong>Troca com ${escapeHTML(friendProfile)}</strong>
          <span>${size ? `${size} por ${size} possivel agora` : "Ainda nao ha troca equilibrada"}</span>
        </div>
        <button type="button" ${size ? "" : "disabled"} onclick="openSuggestedTrade(50)">Solicitar troca</button>
      `;
    }
    async function refreshFriendInsights() {
      if (!friendInsights) return;
      if (!liveEnabled || !liveProfile) {
        renderFriendInsights([]);
        return;
      }
      renderFriendInsights(friendRankingItems.length ? friendRankingItems : rankingItemsFromProfiles());
      if (!liveProfilesList.length) await loadLiveProfiles();
      renderFriendInsights(rankingItemsFromProfiles());
    }
    async function openTradesForFriend(profile) {
      switchAppPage("friends", { clearFilters: false });
      syncFriendSelects(profile);
      await loadFriendAlbum(profile, "friends");
      renderFriendTradePrompt();
      loadTradeRequests().catch(() => {});
      openSuggestedTrade(50);
    }

    function autoTradeSuggestion(maxItems = 5) {
      const gives = possibleTradeGivesFriendNeeds();
      const receives = possibleTradeReceives();
      const size = Math.min(Math.max(1, maxItems), gives.length, receives.length);
      return { size, gives: gives.slice(0, size), receives: receives.slice(0, size) };
    }

    function openSuggestedTrade(maxItems = 5) {
      const suggestion = autoTradeSuggestion(maxItems);
      if (!suggestion.size) {
        setSaveStatus("Ainda nao ha troca automatica poss\u00edvel");
        return;
      }
      resetTradeSelection();
      selectedTradeGiveIds = suggestion.gives.map(sticker => sticker.id);
      selectedTradeReceiveIds = suggestion.receives.map(sticker => sticker.id);
      tradeDetailId = "";
      tradeModalOpen = true;
      document.body.classList.add("modal-open");
      renderTradeModal();
    }


    function cleanLiveProfileName(value) {
      return String(value || "").trim().replace(/\s+/g, "").slice(0, 24);
    }

    function userInitial(value) {
      return (String(value || "U").trim().charAt(0) || "U").toUpperCase();
    }

    function profilePhotoStorageKey() {
      return `${PROFILE_PHOTO_KEY}_${cleanLiveProfileName(liveProfile || "local").toLowerCase() || "local"}`;
    }

    function savedProfilePhoto() {
      if (onlineProfilePhoto) return onlineProfilePhoto;
      try {
        return localStorage.getItem(profilePhotoStorageKey()) || "";
      } catch {
        return "";
      }
    }

    function applyProfilePhoto(target, photo, fallback) {
      if (!target) return;
      target.style.backgroundImage = photo ? `url("${photo}")` : "";
      target.style.backgroundPosition = "center";
      target.style.backgroundRepeat = "no-repeat";
      target.style.backgroundSize = "cover";
      target.textContent = photo ? "" : fallback;
    }

    function syncProfilePhotoUI() {
      const photo = savedProfilePhoto();
      const fallback = userInitial(liveProfile || "Conta");
      applyProfilePhoto(userMenuInitial, photo, fallback);
      applyProfilePhoto(mobileUserAvatar, photo, fallback);
      applyProfilePhoto(profilePhotoPreview, photo, fallback);
    }

    function resizeProfilePhoto(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Nao foi poss\u00edvel ler a imagem."));
        reader.onload = () => {
          const image = new Image();
          image.onerror = () => reject(new Error("O ficheiro escolhido nao e uma imagem valida."));
          image.onload = () => {
            const size = 256;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext("2d");
            if (!context) return reject(new Error("Nao foi poss\u00edvel preparar a imagem."));

            const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
            const sourceX = Math.max(0, (image.naturalWidth - cropSize) / 2);
            const sourceY = Math.max(0, (image.naturalHeight - cropSize) / 2);
            context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, size, size);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          };
          image.src = String(reader.result || "");
        };
        reader.readAsDataURL(file);
      });
    }

    async function changeProfilePhoto(input) {
      const file = input?.files?.[0];
      if (!file) return;

      try {
        if (!file.type.startsWith("image/")) throw new Error("Escolhe um ficheiro de imagem.");
        if (file.size > 8 * 1024 * 1024) throw new Error("A imagem nao pode ultrapassar 8 MB.");
        const photo = await resizeProfilePhoto(file);
        onlineProfilePhoto = photo;
        localStorage.setItem(profilePhotoStorageKey(), photo);
        await saveProfilePhotoSettings(photo);
        syncProfilePhotoUI();
        setSettingsMessage(settingsProfilePhotoMessage, "Foto guardada na tua conta.");
      } catch (error) {
        setSettingsMessage(settingsProfilePhotoMessage, error.message || "Nao foi poss\u00edvel guardar a foto.", true);
      } finally {
        input.value = "";
      }
    }

    async function clearProfilePhoto() {
      try {
        localStorage.removeItem(profilePhotoStorageKey());
      } catch {}
      onlineProfilePhoto = "";
      if (liveEnabled && liveProfile) {
        try { await saveProfilePhotoSettings(""); } catch (error) { setSettingsMessage(settingsProfilePhotoMessage, error.message, true); }
      }
      if (profilePhotoInput) profilePhotoInput.value = "";
      syncProfilePhotoUI();
      setSettingsMessage(settingsProfilePhotoMessage, "Foto removida da tua conta.");
    }

    function closeUserMenu() {
      if (!userMenuPanel || !userMenuButton) return;
      userMenuPanel.classList.add("hidden");
      userMenuButton.setAttribute("aria-expanded", "false");
    }

    function toggleUserMenu(forceOpen) {
      if (!userMenuPanel || !userMenuButton) return;
      const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : userMenuPanel.classList.contains("hidden");
      userMenuPanel.classList.toggle("hidden", !shouldOpen);
      userMenuButton.setAttribute("aria-expanded", String(shouldOpen));
    }

    function updateUserMenu() {
      const name = liveProfile || "Conta";
      if (userMenuName) userMenuName.textContent = name;
      if (userMenuProfile) userMenuProfile.textContent = liveProfile || "Sem sessao";
      syncProfilePhotoUI();
    }

    function syncFriendSelects(value = friendProfile) {
      if (liveFriendSelect) liveFriendSelect.value = value || "";
      if (tradeFriendSelect) tradeFriendSelect.value = value || "";
    }

    function toggleFriendsPanel(forceOpen) {
      if (forceOpen === false) {
        showMyAlbum();
        return;
      }

      openFriendsPage();
    }

    function openFriendsPage() {
      switchAppPage("friends");
      renderFriendInsights(friendRankingItems.length ? friendRankingItems : [currentUserRankingItem()]);
      const profilesPromise = loadLiveProfiles();
      profilesPromise.then(() => refreshFriendInsights()).catch(() => renderFriendInsights([currentUserRankingItem()]));
      profilesPromise.then(() => scheduleTradeOverviewRefresh()).catch(() => renderTradeOverview());
      renderTradePanel();
      if (liveComparison) liveComparison.innerHTML = "";
      render();
    }
    function showMyAlbum() {
      clearAlbumFilters();
      activePage = "album";
      friendProfile = "";
      friendStickers = [];
      friendUpdatedAt = "";
      friendUserColor = DEFAULT_USER_COLOR;
      syncFriendSelects("");
      if (liveComparison) liveComparison.innerHTML = "";
      setSaveStatus("A ver a tua caderneta");
      closeUserMenu();
      render();
      renderTradePanel();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function openDuplicatesView() {
      if (search) search.value = "";
      activePage = "album";
      currentView = "duplicates";
      selectedCountry = "all";
      countryModalOpen = false;
      friendProfile = "";
      friendStickers = [];
      friendUpdatedAt = "";
      friendUserColor = DEFAULT_USER_COLOR;
      search.value = "";
      document.body.classList.remove("modal-open");
      syncFriendSelects("");
      if (liveComparison) liveComparison.innerHTML = "";
      setSaveStatus("A ver os cromos repetidos");
      closeUserMenu();
      render();
      renderTradePanel();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function loadFriendAlbum(profile, page = activePage) {
      const friend = String(profile || "").trim();
      const loadSequence = ++friendLoadSequence;
      if (!friend) {
        friendProfile = "";
        friendStickers = [];
        friendUpdatedAt = "";
        friendUserColor = DEFAULT_USER_COLOR;
        syncFriendSelects("");
        render();
        renderTradePanel();
        return;
      }

      if (!liveEnabled || !liveProfile) {
        setSaveStatus("Entra primeiro para ver amigos");
        return;
      }

      activePage = page;
      friendProfile = friend;
      updatePageVisibility();
      syncFriendSelects(friend);
      if (liveComparison) liveComparison.innerHTML = "";
      const cached = getCachedFriendAlbum(friend);
      if (cached) {
        applyFriendAlbumData(friend, cached);
        renderFriendInsights();
        render();
        renderTradePanel();
        setSaveStatus(`A ver caderneta de ${friend}`);
        return;
      } else {
        friendStickers = [];
        setSaveStatus(`A carregar ${friend}`);
        renderFriendInsights();
        render();
      }

      try {
        const data = await fetchFriendAlbumCached(friend);
        if (loadSequence !== friendLoadSequence || friendProfile !== friend) return;
        applyFriendAlbumData(friend, data);
        if (!albumCountries().includes(selectedCountry)) selectedCountry = "all";
        if (liveComparison) liveComparison.innerHTML = "";
        setSaveStatus(`A ver caderneta de ${friend}`);
        renderFriendInsights();
        render();
        renderTradePanel();
      } catch (error) {
        liveComparison.innerHTML = `<div class="comparison-empty">Nao foi poss\u00edvel abrir a caderneta deste user.</div>`;
        setSaveStatus("Erro ao abrir amigo");
        console.error(error);
      }
    }

    async function selectLiveFriend(profile) {
      await loadFriendAlbum(profile, "friends");
    }

    async function selectTradeFriend(profile) {
      await loadFriendAlbum(profile, "friends");
    }


    function updateDesktopNav() {
      if (!desktopNav) return;
      const page = activePage === "album" && currentView === "duplicates" ? "duplicates" : activePage;
      desktopNav.querySelectorAll("button[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
      });
    }
    function updateMobileBottomNav() {
      if (!mobileBottomNav) return;
      const page = mobileToolsModalOpen ? (mobileToolsModalMode === "profile" ? "account" : "tools") : activePage === "album" && currentView === "duplicates" ? "duplicates" : activePage;
      mobileBottomNav.querySelectorAll("button[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
      });
      syncProfilePhotoUI();
    }

    function isMobileShell() {
      return window.matchMedia?.("(max-width: 760px)")?.matches || window.innerWidth <= 760;
    }

    function openMobileToolsHub() {
      closeMobileToolsModal();
      switchAppPage("tools");
    }
    function openMobileAccountHub() {
      closeMobileToolsModal();
      openAccountPanel();
    }

    function closeMobileToolsModal() {
      mobileToolsModalOpen = false;
      mobileToolsModal?.classList.add("hidden");
      mobileToolsModal?.setAttribute("aria-hidden", "true");
      if (!countryModalOpen && !tradeModalOpen && !reserveModalOpen) document.body.classList.remove("modal-open");
      updateMobileBottomNav();
    }

    function mobileToolButton(title, subtitle, action, danger = false) {
      return `<button class="mobile-tool-action ${danger ? "danger" : ""}" type="button" onclick="closeMobileToolsModal(); ${action}"><strong>${escapeHTML(title)}</strong><small>${escapeHTML(subtitle)}</small></button>`;
    }

    function mobileProfileAvatarMarkup() {
      if (profilePhotoData) return `<img src="${escapeHTML(profilePhotoData)}" alt="" />`;
      return escapeHTML((liveProfile || "U").slice(0, 1).toUpperCase());
    }

    function mobileProfileStatsMarkup() {
      const album = stickers || [];
      const total = album.length;
      const owned = album.filter(sticker => sticker.tenho).length;
      const missing = total - owned;
      const duplicates = album.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const reserved = album.reduce((sum, sticker) => sum + reservedDuplicates(sticker), 0);
      const percent = total ? Math.round((owned / total) * 100) : 0;
      return `
        <div class="mobile-profile-stats">
          <div class="mobile-profile-stat"><span>Obtidos</span><strong>${owned}</strong></div>
          <div class="mobile-profile-stat"><span>Faltam</span><strong>${missing}</strong></div>
          <div class="mobile-profile-stat"><span>Progresso</span><strong>${percent}%</strong></div>
          <div class="mobile-profile-stat"><span>Repetidos</span><strong>${duplicates}${reserved ? `(${reserved})` : ""}</strong></div>
        </div>
      `;
    }


    function renderAccountOverview() {
      if (!accountOverview) return;
      const album = stickers || [];
      const total = album.length;
      const owned = album.filter(sticker => sticker.tenho).length;
      const missing = Math.max(0, total - owned);
      const duplicates = album.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const reserved = album.reduce((sum, sticker) => sum + reservedDuplicates(sticker), 0);
      const percent = total ? Math.round((owned / total) * 100) : 0;
      const pendingTrades = (tradeRequests || []).filter(trade => trade.status === "pending").length;
      accountOverview.innerHTML = `
        <section class="account-client-card">
          <div class="account-client-head">
            <span class="mobile-profile-avatar">${mobileProfileAvatarMarkup()}</span>
            <div>
              <strong>${escapeHTML(liveProfile || "Conta")}</strong>
              <span>Área da conta</span>
            </div>
          </div>
          <div class="account-client-progress">
            <span>${owned}/${total} obtidos - ${percent}%</span>
            <i style="width:${percent}%"></i>
          </div>
          <div class="mobile-profile-stats account-client-stats">
            <div class="mobile-profile-stat"><span>Faltam</span><strong>${missing}</strong></div>
            <div class="mobile-profile-stat"><span>Repetidos</span><strong>${duplicates}${reserved ? `(${reserved})` : ""}</strong></div>
            <div class="mobile-profile-stat"><span>Trocas</span><strong>${pendingTrades}</strong></div>
            <div class="mobile-profile-stat"><span>Progresso</span><strong>${percent}%</strong></div>
          </div>
          <div class="account-client-actions">
            <button type="button" onclick="openNotificationsPanel()">Notificações</button>
            <button type="button" onclick="openTradesPanel()">Trocas</button>
            <button type="button" onclick="openSettingsPanel()">Definições</button>
            <button class="secondary" type="button" onclick="logoutLiveAccount()">Logout</button>
          </div>
        </section>
      `;
    }
    function renderMobileToolsModal() {
      if (!mobileToolsModal || !mobileToolsModalBody) return;
      if (!mobileToolsModalOpen) {
        mobileToolsModal.classList.add("hidden");
        mobileToolsModal.setAttribute("aria-hidden", "true");
        return;
      }
      mobileToolsModal.classList.remove("hidden");
      mobileToolsModal.setAttribute("aria-hidden", "false");
      const isProfile = mobileToolsModalMode === "profile";
      mobileToolsModalBody.innerHTML = isProfile ? `
        <div class="trade-modal-head">
          <div>
            <h2>Perfil</h2>
            <p>A tua conta e definições.</p>
          </div>
          <button class="trade-modal-close secondary" type="button" onclick="closeMobileToolsModal()" aria-label="Fechar">x</button>
        </div>
        <div class="mobile-tools-profile">
          <div class="mobile-profile-card">
            <span class="mobile-profile-avatar">${mobileProfileAvatarMarkup()}</span>
            <div>
              <strong>${escapeHTML(liveProfile || "Conta")}</strong>
              <span>Caderneta Mundial 2026</span>
            </div>
          </div>
          ${mobileProfileStatsMarkup()}
          <div class="mobile-tools-grid">
            ${mobileToolButton("Conta", "Foto, cor e password", "openAccountPanel()")}
            ${mobileToolButton("Definições", "Tema e app", "openSettingsPanel()")}
            ${mobileToolButton("Notificações", "Trocas e atividade", "openNotificationsPanel()")}
            ${mobileToolButton("Instalar app", "Atalho no telemóvel", "installPwaApp()")}
            ${mobileToolButton("Logout", "Sair da conta", "logoutLiveAccount()", true)}
          </div>
        </div>
      ` : `
        <div class="trade-modal-head">
          <div>
            <h2>Funções</h2>
            <p>Escolhe o que queres fazer.</p>
          </div>
          <button class="trade-modal-close secondary" type="button" onclick="closeMobileToolsModal()" aria-label="Fechar">x</button>
        </div>
        <div class="mobile-tools-grid">
          ${mobileToolButton("Trocas", "Propostas e pedidos", "openTradesPanel()")}
          ${mobileToolButton("Comparar listas", "Ver se uma lista te ajuda", "openListComparePanel()")}
          ${mobileToolButton("Histórico", "Últimas alterações", "openHistoryPanel()")}
          ${mobileToolButton("Notificações", "Atividade da conta", "openNotificationsPanel()")}
          ${mobileToolButton("Repetidos", "Ver cromos repetidos", "openDuplicatesView()")}
        </div>
      `;
    }
    function tradeCompatibilityForAlbum(profile, album, userColor = DEFAULT_USER_COLOR) {
      const friendById = new Map(album.map(sticker => [sticker.id, sticker]));
      const mineById = new Map(stickers.map(sticker => [sticker.id, sticker]));
      const myDuplicates = stickers.filter(sticker => sticker.tenho && availableDuplicates(sticker) > 0);
      const friendDuplicates = album.filter(sticker => sticker.tenho && availableDuplicates(sticker) > 0);
      const iCanGive = myDuplicates.filter(sticker => {
        const friendSticker = friendById.get(sticker.id);
        return friendSticker && !friendSticker.tenho;
      });
      const friendCanGive = friendDuplicates.filter(sticker => {
        const mine = mineById.get(sticker.id);
        return mine && !mine.tenho;
      });
      return {
        profile,
        userColor: sanitizeUserColor(userColor),
        friendDuplicateCopies: duplicateCopyCount(friendDuplicates),
        friendDuplicateUnique: friendDuplicates.length,
        iCanGiveUnique: iCanGive.length,
        friendCanGiveUnique: friendCanGive.length,
        balanced: Math.min(iCanGive.length, friendCanGive.length)
      };
    }

    function renderTradeOverview() {
      if (!tradeOverview) return;
      if (!liveEnabled || !liveProfile) {
        tradeOverview.innerHTML = "";
        return;
      }
      const myDuplicates = stickers.filter(sticker => sticker.tenho && availableDuplicates(sticker) > 0);
      const usefulFriends = tradeOverviewItems.filter(item => item.friendDuplicateCopies > 0);
      const friendsNeedMine = tradeOverviewItems.reduce((sum, item) => sum + item.iCanGiveUnique, 0);
      const friendCards = usefulFriends.map(item =>
        '<button class="trade-overview-card trade-overview-card-button" type="button" onclick="openTradesForFriend(\'' + escapeJS(item.profile) + '\')" style="border-color:' + escapeHTML(item.userColor) + '">' +
          '<strong>Repetidos do ' + escapeHTML(item.profile) + '</strong>' +
          '<div class="trade-overview-counts">' +
            '<span><b>' + item.friendCanGiveUnique + '</b>Ele tem para ti</span>' +
            '<span><b>' + item.iCanGiveUnique + '</b>Tu tens para ele</span>' +
          '</div>' +
          '<small>Clica para montar troca</small>' +
        '</button>'
      ).join("");
      tradeOverview.innerHTML =
        '<div class="trade-overview-head">' +
          '<strong>Quem tem cromos que te interessam</strong>' +
          '<small>' + (tradeOverviewLoading ? 'A atualizar...' : usefulFriends.length + ' amigos com repetidos') + '</small>' +
        '</div>' +
        '<div class="trade-overview-grid">' +
          '<article class="trade-overview-card is-main">' +
            '<strong>Os teus repetidos</strong>' +
            '<div class="trade-overview-counts">' +
              '<span><b>' + duplicateCopyCount(myDuplicates) + '</b>Total</span>' +
              '<span><b>' + friendsNeedMine + '</b>Amigos precisam</span>' +
            '</div>' +
          '</article>' +
          (friendCards || '<div class="comparison-empty">Nenhum amigo tem repetidos neste momento.</div>') +
        '</div>';
    }

    async function refreshTradeOverview() {
      if (!tradeOverview || !liveEnabled || !liveProfile) return;
      tradeOverviewLoading = true;
      renderTradeOverview();
      try {
        const response = await apiFetch("/api/live/compatibility", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Nao foi possivel calcular as trocas");
        tradeOverviewItems = (data.summaries || []).sort((a, b) => b.friendCanGiveUnique - a.friendCanGiveUnique || b.balanced - a.balanced || a.profile.localeCompare(b.profile, "pt-PT"));
        const compatibilityByProfile = new Map(tradeOverviewItems.map(item => [item.profile, item]));
        friendRankingItems = rankingItemsFromProfiles().map(item => {
          const summary = compatibilityByProfile.get(item.profile);
          return summary ? {
            ...item,
            canGiveCount: summary.iCanGiveUnique,
            canReceiveCount: summary.friendCanGiveUnique,
            compatibilityReady: true
          } : item;
        });
        if (activePage === "friends") renderFriendInsights(friendRankingItems);
      } finally {
        tradeOverviewLoadedAt = Date.now();
        tradeOverviewLoading = false;
        renderTradeOverview();
      }
    }
    function stickerTradeLabel(sticker) {
      return `${exportGroupLabel(sticker.pais)} ${stickerExportNumber(sticker)} - ${sticker.nome}`;
    }

    function possibleTradeGives() {
      if (!hasSelectedFriend()) return [];
      return stickers.filter(sticker => sticker.tenho && availableDuplicates(sticker) > 0);
    }

    function possibleTradeGivesFriendNeeds() {
      if (!hasSelectedFriend()) return [];
      const friendById = new Map(friendStickers.map(sticker => [sticker.id, sticker]));
      return stickers.filter(sticker => {
        const friendSticker = friendById.get(sticker.id);
        return sticker.tenho && availableDuplicates(sticker) > 0 && friendSticker && !friendSticker.tenho;
      });
    }

    function possibleTradeGivesFriendAlreadyHas() {
      if (!hasSelectedFriend()) return [];
      const friendById = new Map(friendStickers.map(sticker => [sticker.id, sticker]));
      return stickers.filter(sticker => {
        const friendSticker = friendById.get(sticker.id);
        return sticker.tenho && availableDuplicates(sticker) > 0 && friendSticker && friendSticker.tenho;
      });
    }

    function possibleTradeReceives() {
      if (!hasSelectedFriend()) return [];
      const mineById = new Map(stickers.map(sticker => [sticker.id, sticker]));
      return friendStickers.filter(sticker => {
        const mine = mineById.get(sticker.id);
        return sticker.tenho && availableDuplicates(sticker) > 0 && mine && !mine.tenho;
      });
    }

    function duplicateCopyCount(list) {
      return (list || []).reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
    }

    function friendDuplicateStickers() {
      if (!hasSelectedFriend()) return [];
      return friendStickers.filter(sticker => sticker.tenho && availableDuplicates(sticker) > 0);
    }

    function renderTradeQuickStats(givesFriendNeeds = possibleTradeGivesFriendNeeds(), receives = possibleTradeReceives()) {
      if (!hasSelectedFriend()) return "";
      const idealSize = Math.min(givesFriendNeeds.length, receives.length, 50);
      const idealText = idealSize ? "Da para propor ate " + idealSize + " por " + idealSize + " cromos." : "Ainda nao ha troca equilibrada disponivel.";
      return `
        <div class="quick-trade-hero">
          <div><strong>Melhor troca poss\u00edvel com ${escapeHTML(friendProfile || "este amigo")}</strong><span>${escapeHTML(idealText)}</span></div>
          <button type="button" ${idealSize ? "" : "disabled"} onclick="openSuggestedTrade(50)">Propor ideal</button>
        </div>
      `;
    }

    function tradeOption(sticker) {
      return `<option value="${escapeHTML(sticker.id)}">${escapeHTML(stickerTradeLabel(sticker))}</option>`;
    }

    function tradePickCard(sticker, side) {
      const selected = side === "give"
        ? selectedTradeGiveIds.includes(sticker.id)
        : selectedTradeReceiveIds.includes(sticker.id);
      return `
        <button class="trade-pick-card ${selected ? "is-selected" : ""}" type="button" onclick="toggleTradeSelection('${side}', '${escapeJS(sticker.id)}')">
          <strong>${escapeHTML(exportGroupLabel(sticker.pais))} ${escapeHTML(stickerExportNumber(sticker))}</strong>
          <span>${escapeHTML(sticker.nome)}</span>
        </button>
      `;
    }

    function tradeSelectionIds(side) {
      return side === "give" ? selectedTradeGiveIds : selectedTradeReceiveIds;
    }

    function tradeSelectedStickers(list, side) {
      const ids = new Set(tradeSelectionIds(side));
      return list.filter(sticker => ids.has(sticker.id));
    }

    function clampTradePickPage(side, totalItems) {
      const totalPages = Math.max(1, Math.ceil(totalItems / TRADE_PICK_PAGE_SIZE));
      const page = Math.max(1, Math.min(tradePickPages[side] || 1, totalPages));
      tradePickPages[side] = page;
      return { page, totalPages };
    }

    function paginatedTradePickList(list, side) {
      const { page, totalPages } = clampTradePickPage(side, list.length);
      const start = (page - 1) * TRADE_PICK_PAGE_SIZE;
      return {
        page,
        totalPages,
        items: list.slice(start, start + TRADE_PICK_PAGE_SIZE)
      };
    }

    function setTradePickPage(side, page) {
      tradePickPages[side] = Number(page) || 1;
      renderTradeModal();
    }

    function renderTradePickPagination(side, page, totalPages) {
      if (totalPages <= 1) return "";
      return `
        <div class="trade-pick-pagination">
          <button class="secondary" type="button" onclick="setTradePickPage('${side}', ${page - 1})" ${page <= 1 ? "disabled" : ""}><</button>
          <span>Página ${page}/${totalPages}</span>
          <button class="secondary" type="button" onclick="setTradePickPage('${side}', ${page + 1})" ${page >= totalPages ? "disabled" : ""}>></button>
        </div>
      `;
    }

    function renderTradeGroupedSummary(list, title = "Selecionados") {
      return `<div class="trade-grouped-summary"><strong>${escapeHTML(title)}</strong><span>${tradeStickerList(list)}</span></div>`;
    }

    function resetTradeSelection() {
      selectedTradeGiveIds = [];
      selectedTradeReceiveIds = [];
      tradePickPages = { give: 1, receive: 1 };
    }

    function openTradeModal() {
      if (!hasSelectedFriend()) {
        setSaveStatus("Escolhe primeiro um amigo");
        return;
      }
      resetTradeSelection();
      tradeDetailId = "";
      tradeModalOpen = true;
      document.body.classList.add("modal-open");
      renderTradeModal();
    }

    function closeTradeModal() {
      tradeModalOpen = false;
      tradeDetailId = "";
      resetTradeSelection();
      if (!countryModalOpen) document.body.classList.remove("modal-open");
      if (tradeModal) {
        tradeModal.classList.add("hidden");
        tradeModal.setAttribute("aria-hidden", "true");
      }
    }

    function modalTouchPanel(type) {
      return type === "country"
        ? countryModalPanel
        : tradeModal?.querySelector(".trade-modal-panel");
    }

    function modalTouchPoint(event) {
      return event.changedTouches?.[0] || event.touches?.[0] || null;
    }

    function startModalTouchGesture(event, type) {
      if (!event.touches || event.touches.length !== 1) return;
      const target = event.target;
      if (target?.closest?.("button, input, select, textarea, a, .trade-pick-list, .duplicate-controls")) return;
      if (type === "country" && (!countryModalOpen || selectedCountry === "all")) return;
      if (type === "trade" && !tradeModalOpen) return;

      const point = modalTouchPoint(event);
      const panel = modalTouchPanel(type);
      if (!point || !panel) return;

      modalTouchGesture = {
        type,
        panel,
        startX: point.clientX,
        startY: point.clientY,
        lastX: point.clientX,
        lastY: point.clientY,
        scrollTop: panel.scrollTop || 0,
        direction: ""
      };
      panel.classList.add("is-touching");
    }

    function moveModalTouchGesture(event) {
      if (!modalTouchGesture || !event.touches || event.touches.length !== 1) return;
      const point = modalTouchPoint(event);
      if (!point) return;

      const gesture = modalTouchGesture;
      const dx = point.clientX - gesture.startX;
      const dy = point.clientY - gesture.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      gesture.lastX = point.clientX;
      gesture.lastY = point.clientY;

      if (!gesture.direction && Math.max(absX, absY) > 14) {
        gesture.direction = absX > absY * 1.2 ? "x" : "y";
      }

      if (gesture.type === "country" && gesture.direction === "x") {
        event.preventDefault();
        gesture.panel.style.transform = `translateX(${Math.max(-90, Math.min(90, dx * 0.35))}px)`;
        return;
      }

      if (gesture.direction === "y" && dy > 0 && gesture.scrollTop <= 2 && absY > absX * 1.15) {
        event.preventDefault();
        gesture.panel.style.transform = `translateY(${Math.min(130, dy * 0.42)}px)`;
      }
    }

    function clearModalTouchTransform(panel) {
      if (!panel) return;
      panel.classList.remove("is-touching");
      panel.style.transform = "";
    }

    function endModalTouchGesture() {
      const gesture = modalTouchGesture;
      modalTouchGesture = null;
      if (!gesture) return;

      const dx = gesture.lastX - gesture.startX;
      const dy = gesture.lastY - gesture.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      clearModalTouchTransform(gesture.panel);

      if (dy > 92 && absY > absX * 1.15 && gesture.scrollTop <= 2) {
        if (gesture.type === "country") closeCountryModal();
        else closeTradeModal();
        return;
      }

      if (gesture.type === "country" && absX > 76 && absX > absY * 1.25) {
        moveCountryModal(dx < 0 ? 1 : -1);
      }
    }

    function cancelModalTouchGesture() {
      const panel = modalTouchGesture?.panel;
      modalTouchGesture = null;
      clearModalTouchTransform(panel);
    }

    function tradePickScrollState() {
      const state = {};
      document.querySelectorAll(".trade-pick-list[data-trade-side]").forEach(list => {
        state[list.dataset.tradeSide] = list.scrollTop;
      });
      return state;
    }

    function restoreTradePickScrollState(state) {
      if (!state) return;
      requestAnimationFrame(() => {
        document.querySelectorAll(".trade-pick-list[data-trade-side]").forEach(list => {
          const value = state[list.dataset.tradeSide];
          if (Number.isFinite(value)) list.scrollTop = value;
        });
      });
    }

    function toggleTradeSelection(side, stickerId) {
      const scrollState = tradePickScrollState();
      const list = side === "give" ? selectedTradeGiveIds : selectedTradeReceiveIds;
      const index = list.indexOf(stickerId);
      if (index >= 0) list.splice(index, 1);
      else list.push(stickerId);
      renderTradeModal(scrollState);
    }

    function setTradeSideSelection(side, mode) {
      const scrollState = tradePickScrollState();
      const source = side === "give" ? possibleTradeGivesFriendNeeds() : possibleTradeReceives();
      const target = side === "give" ? selectedTradeGiveIds : selectedTradeReceiveIds;
      target.splice(0, target.length, ...(mode === "all" ? source.map(sticker => sticker.id) : []));
      renderTradeModal(scrollState);
    }

    function selectAllTradeStickers() {
      const scrollState = tradePickScrollState();
      selectedTradeGiveIds = possibleTradeGivesFriendNeeds().map(sticker => sticker.id);
      selectedTradeReceiveIds = possibleTradeReceives().map(sticker => sticker.id);
      renderTradeModal(scrollState);
    }
    function tradeSelectionIsBalanced() {
      return selectedTradeGiveIds.length > 0 && selectedTradeGiveIds.length === selectedTradeReceiveIds.length;
    }

    function renderTradeModal(scrollState = null) {
      if (!tradeModal || !tradeModalBody) return;
      if (!tradeModalOpen) {
        tradeModal.classList.add("hidden");
        tradeModal.setAttribute("aria-hidden", "true");
        return;
      }
      if (tradeDetailId) {
        renderTradeDetailModal();
        return;
      }

      const gives = possibleTradeGivesFriendNeeds();
      const receives = possibleTradeReceives();
      const balanced = tradeSelectionIsBalanced();
      const hasEnough = gives.length && receives.length;
      const givePage = paginatedTradePickList(gives, "give");
      const receivePage = paginatedTradePickList(receives, "receive");
      const selectedGives = tradeSelectedStickers(gives, "give");
      const selectedReceives = tradeSelectedStickers(receives, "receive");
      const balanceText = selectedTradeGiveIds.length === selectedTradeReceiveIds.length
        ? `${selectedTradeGiveIds.length} por ${selectedTradeReceiveIds.length}`
        : `${selectedTradeGiveIds.length} por ${selectedTradeReceiveIds.length} - escolhe a mesma quantidade`;

      tradeModal.classList.remove("hidden");
      tradeModal.setAttribute("aria-hidden", "false");
      tradeModalBody.innerHTML = `
        <div class="trade-modal-head">
          <div>
            <h2 >Proposta para ${escapeHTML(friendProfile)}</h2>
            <p>Seleciona só cromos que o ${escapeHTML(friendProfile)} precisa e cromos dele que te faltam.</p>
            <div class="trade-modal-balance">${escapeHTML(balanceText)}</div>
            <button class="trade-select-all-button secondary" type="button" onclick="selectAllTradeStickers()" ${hasEnough ? "" : "disabled"}>Selecionar tudo</button>
          </div>
          <button class="trade-modal-close secondary" type="button" onclick="closeTradeModal()" aria-label="Fechar">x</button>
        </div>
        ${hasEnough ? `
          <div class="trade-pick-grid">
            <div class="trade-pick-column">
              <div class="trade-pick-column-title">
                <span>Tu dás</span>
                <span>${selectedTradeGiveIds.length}/${gives.length}</span>
                <span class="trade-pick-title-actions"><button class="secondary" type="button" onclick="setTradeSideSelection('give', 'all')">Todos</button><button class="secondary" type="button" onclick="setTradeSideSelection('give', 'none')">Limpar</button></span>
              </div>
              ${renderTradeGroupedSummary(selectedGives)}
              <div class="trade-pick-list" data-trade-side="give">${givePage.items.map(sticker => tradePickCard(sticker, "give")).join("")}</div>
              ${renderTradePickPagination("give", givePage.page, givePage.totalPages)}
            </div>
            <div class="trade-pick-column">
              <div class="trade-pick-column-title">
                <span>Tu recebes</span>
                <span>${selectedTradeReceiveIds.length}/${receives.length}</span>
                <span class="trade-pick-title-actions"><button class="secondary" type="button" onclick="setTradeSideSelection('receive', 'all')">Todos</button><button class="secondary" type="button" onclick="setTradeSideSelection('receive', 'none')">Limpar</button></span>
              </div>
              ${renderTradeGroupedSummary(selectedReceives)}
              <div class="trade-pick-list" data-trade-side="receive">${receivePage.items.map(sticker => tradePickCard(sticker, "receive")).join("")}</div>
              ${renderTradePickPagination("receive", receivePage.page, receivePage.totalPages)}
            </div>
          </div>
          <div class="trade-modal-actions">
            <span class="trade-modal-balance">A proposta so pode ser enviada quando for 1 por 1, 2 por 2, 3 por 3...</span>
            <button type="button" onclick="proposeTrade()" ${balanced ? "" : "disabled"}>Enviar proposta</button>
          </div>
        ` : `<div class="comparison-empty">Nao ha cromos suficientes para montar uma troca equilibrada.</div>`}
      `;
      restoreTradePickScrollState(scrollState);
    }

    function renderTradeSuggestions() {
      if (!tradeSuggestions) return;

      if (!hasSelectedFriend()) {
        tradeSuggestions.innerHTML = `
          <div class="comparison-empty">
            Escolhe um amigo ou clica num cartao acima para montar uma troca.
          </div>
        `;
        closeTradeModal();
        return;
      }

      const givesFriendNeeds = possibleTradeGivesFriendNeeds();
      const receives = possibleTradeReceives();
      const suggestion = autoTradeSuggestion(5);
      const quickStats = renderTradeQuickStats(givesFriendNeeds, receives);

      if (!givesFriendNeeds.length || !receives.length) {
        tradeSuggestions.innerHTML = `
          ${quickStats}
          <div class="trade-select-grid">
            <div class="trade-card">
              <div class="trade-card-title">Tu podes dar</div>
              <div class="trade-lines is-scrollable">${tradeStickerList(givesFriendNeeds)}</div>
            </div>
            <div class="trade-card">
              <div class="trade-card-title">Tu podes receber</div>
              <div class="trade-lines is-scrollable">${tradeStickerList(receives)}</div>
            </div>
          </div>
          <div class="comparison-empty">Ainda nao ha cromos suficientes para uma troca equilibrada com este amigo.</div>
        `;
        closeTradeModal();
        return;
      }

      tradeSuggestions.innerHTML = `
        ${quickStats}
        <div class="trade-builder">
          <div class="trade-card-title">Nova proposta para ${escapeHTML(friendProfile)}</div>
          <div class="trade-select-grid">
            <div class="trade-card">
              <div class="trade-card-title">Tu podes dar</div>
              <div class="trade-lines is-scrollable">${tradeStickerList(givesFriendNeeds)}</div>
            </div>
            <div class="trade-card">
              <div class="trade-card-title">Tu podes receber</div>
              <div class="trade-lines is-scrollable">${tradeStickerList(receives)}</div>
            </div>
          </div>
          <div class="trade-select-grid">
            <div class="trade-card">
              <div class="trade-card-title">Sugestao automatica</div>
              <div class="trade-lines">${suggestion.size} por ${suggestion.size}<br>${tradeStickerList(suggestion.gives)}<br><br>${tradeStickerList(suggestion.receives)}</div>
            </div>
          </div>
          <div class="trade-actions">
            <button type="button" onclick="openSuggestedTrade(5)">Montar sugestao ${suggestion.size} por ${suggestion.size}</button>
            <button class="secondary" type="button" onclick="openTradeModal()">Escolher manualmente</button>
          </div>
        </div>
      `;
      if (tradeModalOpen) renderTradeModal();
    }

    function tradeStatusText(status) {
      return {
        pending: "pendente",
        accepted: "aceite",
        rejected: "recusada",
        cancelled: "cancelada"
      }[status] || status || "pendente";
    }

    function tradeStickerGroupedCodes(list) {
      const groups = new Map();
      (Array.isArray(list) ? list : []).forEach(sticker => {
        const country = exportGroupLabel(sticker.pais);
        const number = stickerExportNumber(sticker);
        if (!groups.has(country)) groups.set(country, new Map());
        const countryMap = groups.get(country);
        countryMap.set(number, (countryMap.get(number) || 0) + 1);
      });
      return groups;
    }

    function tradeStickerCodeText(number, count) {
      return count > 1 ? `${number} x${count}` : number;
    }

    function tradeStickerList(list) {
      if (!list || !list.length) return "Sem cromos";
      return [...tradeStickerGroupedCodes(list).entries()]
        .map(([country, codes]) => `${escapeHTML(country)}: ${[...codes.entries()].map(([number, count]) => escapeHTML(tradeStickerCodeText(number, count))).join(" ")}`)
        .join("<br>");
    }

    function tradeStickerInlineList(list) {
      if (!list || !list.length) return "Sem cromos";
      return [...tradeStickerGroupedCodes(list).entries()]
        .map(([country, codes]) => `${escapeHTML(country)} ${[...codes.entries()].map(([number, count]) => escapeHTML(tradeStickerCodeText(number, count))).join(", ")}`)
        .join(" Â· ");
    }
    function tradeStickerDetailList(list) {
      return renderTradeGroupedSummary(list || [], "Resumo");
    }

    function tradePartnerName(trade) {
      return trade.direction === "incoming" ? trade.fromUser : trade.toUser;
    }

    function tradeReceivedStickers(trade) {
      return trade.direction === "incoming" ? trade.give : trade.receive;
    }

    function tradeSentStickers(trade) {
      return trade.direction === "incoming" ? trade.receive : trade.give;
    }

    function tradeReceivedPreview(trade) {
      const received = tradeReceivedStickers(trade) || [];
      const first = received[0];
      if (!first) return "Sem cromos recebidos";
      const extra = received.length > 1 ? ` +${received.length - 1}` : "";
      return `${exportGroupLabel(first.pais)} ${stickerExportNumber(first)}${extra}`;
    }

    function tradeRowTitle(trade) {
      const partner = tradePartnerName(trade);
      if (trade.status !== "pending") return `Troca feita com ${partner}: ${tradeReceivedPreview(trade)}`;
      return trade.direction === "incoming" ? `${partner} propos uma troca` : `Proposta enviada a ${partner}`;
    }

    function openTradeDetail(tradeId) {
      tradeDetailId = tradeId;
      tradeModalOpen = true;
      document.body.classList.add("modal-open");
      renderTradeDetailModal();
    }

    function renderTradeDetailModal() {
      if (!tradeModal || !tradeModalBody) return;
      const trade = tradeRequests.find(item => item.id === tradeDetailId);
      if (!trade) {
        closeTradeModal();
        return;
      }
      const giveLabel = trade.direction === "incoming" ? "Recebes" : "Das";
      const receiveLabel = trade.direction === "incoming" ? "Das" : "Recebes";

      tradeModal.classList.remove("hidden");
      tradeModal.setAttribute("aria-hidden", "false");
      tradeModalBody.innerHTML = `
        <div class="trade-modal-head">
          <div>
            <h2 >${escapeHTML(tradeRowTitle(trade))}</h2>
            <p>${escapeHTML(tradeReceivedPreview(trade))} - ${escapeHTML(tradeStatusText(trade.status))}</p>
          </div>
          <button class="trade-modal-close secondary" type="button" onclick="closeTradeModal()" aria-label="Fechar">x</button>
        </div>
        <div class="trade-pick-grid">
          <div class="trade-pick-column">
            <div class="trade-pick-column-title">
              <span>${escapeHTML(giveLabel)}</span>
              <span>${(trade.give || []).length}</span>
            </div>
            ${tradeStickerDetailList(trade.give)}
          </div>
          <div class="trade-pick-column">
            <div class="trade-pick-column-title">
              <span>${escapeHTML(receiveLabel)}</span>
              <span>${(trade.receive || []).length}</span>
            </div>
            ${tradeStickerDetailList(trade.receive)}
          </div>
        </div>
        <div class="trade-modal-actions">
          <span class="trade-modal-balance">Podes aceitar, recusar ou fechar esta proposta.</span>
          ${tradeActionButtons(trade)}
        </div>
      `;
    }

    function tradeActionButtons(trade) {
      if (trade.status !== "pending") return "";
      if (trade.direction === "incoming") {
        return `
          <div class="trade-actions">
            <button type="button" onclick="updateTradeStatus('${escapeJS(trade.id)}', 'accepted')">Aceitar</button>
            <button class="secondary" type="button" onclick="updateTradeStatus('${escapeJS(trade.id)}', 'rejected')">Recusar</button>
          </div>
        `;
      }

      return `
        <div class="trade-actions">
          <button class="secondary" type="button" onclick="updateTradeStatus('${escapeJS(trade.id)}', 'cancelled')">Cancelar</button>
        </div>
      `;
    }

    function setTradeHistoryPage(page) {
      tradeHistoryPage = page;
      renderTradeRequests();
    }

    function renderTradeHistoryPagination(totalPages) {
      if (totalPages <= 1) return "";
      return `
        <div class="trade-pagination">
          <button class="secondary" type="button" onclick="setTradeHistoryPage(${tradeHistoryPage - 1})" ${tradeHistoryPage <= 1 ? "disabled" : ""}>Anterior</button>
          <span>Página ${tradeHistoryPage} de ${totalPages}</span>
          <button class="secondary" type="button" onclick="setTradeHistoryPage(${tradeHistoryPage + 1})" ${tradeHistoryPage >= totalPages ? "disabled" : ""}>Seguinte</button>
        </div>
      `;
    }

    function renderTradeCards(trades) {
      return trades.map(trade => {
        const partner = tradePartnerName(trade);
        const sent = tradeStickerInlineList(tradeSentStickers(trade));
        const received = tradeStickerInlineList(tradeReceivedStickers(trade));
        return `
          <button class="trade-row" type="button" onclick="openTradeDetail('${escapeJS(trade.id)}')">
            <span class="trade-row-main">
              <strong>${escapeHTML(partner)}</strong>
              <span class="trade-row-exchange"><b>Envio:</b> ${sent}<span class="trade-row-separator">x</span><b>Recebes:</b> ${received}</span>
            </span>
            <span class="trade-row-side">
              <span class="trade-status">${escapeHTML(tradeStatusText(trade.status))}</span>
              <span class="trade-open-icon" aria-hidden="true">&#128065;</span>
            </span>
          </button>
        `;
      }).join("");
    }

    function renderTradeRequests() {
      if (!tradeList) return;
      updateTradeBadges();
      if (!tradeRequests.length) {
        tradeList.innerHTML = `<div class="comparison-empty">Ainda nao ha propostas de troca.</div>`;
        return;
      }

      const pending = tradeRequests.filter(trade => trade.status === "pending");
      tradeList.innerHTML = `
        <div class="trade-card-title">Propostas atuais</div>
        ${pending.length ? renderTradeCards(pending) : `<div class="comparison-empty">Nao ha propostas pendentes.</div>`}
      `;
    }

    function renderTradePanel() {
      renderTradeOverview();
      renderTradeSuggestions();
      renderTradeRequests();
      updateMobileBottomNav();
      updateDesktopNav();
    }

    async function loadTradeRequests() {
      if (!liveEnabled || !liveProfile) {
        updateTradeBadges();
        return;
      }
      const response = await apiFetch("/api/live/trades", { cache: "no-store" });
      if (!response.ok) {
        updateTradeBadges();
        return;
      }
      const data = await response.json().catch(() => ({}));
      tradeRequests = Array.isArray(data.trades) ? data.trades : [];
      liveTradesUpdatedAt = tradeRequests.reduce((latest, trade) => {
        const value = trade.updatedAt || trade.createdAt || "";
        return value > latest ? value : latest;
      }, liveTradesUpdatedAt || "");
      tradeHistoryPage = Math.max(1, tradeHistoryPage);
      renderTradeRequests();
      if (activePage === "notifications") renderNotificationsPanel();
    }

    async function proposeTrade() {
      if (!hasSelectedFriend()) {
        setSaveStatus("Escolhe primeiro um amigo");
        return;
      }

      if (!tradeSelectionIsBalanced()) {
        setSaveStatus("A troca tem de ter o mesmo numero de cromos dos dois lados");
        renderTradeModal();
        return;
      }

      try {
        const response = await apiFetch("/api/live/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toUser: friendProfile,
            giveStickerIds: selectedTradeGiveIds,
            receiveStickerIds: selectedTradeReceiveIds
          })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Nao foi poss\u00edvel propor troca");
        setSaveStatus(`Troca proposta a ${friendProfile}`);
        closeTradeModal();
        await loadTradeRequests();
        renderTradePanel();
      } catch (error) {
        setSaveStatus(error.message);
      }
    }

    async function updateTradeStatus(tradeId, status) {
      const shouldCloseDetail = Boolean(tradeDetailId);
      try {
        const response = await apiFetch("/api/live/trades/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tradeId, status })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Nao foi poss\u00edvel atualizar troca");
        setSaveStatus(status === "accepted" ? "Troca aceite e cadernetas atualizadas" : "Troca atualizada");
        await loadTradeRequests();
        await refreshOwnAlbumState();
        if (hasSelectedFriend()) {
          friendAlbumCache.delete(friendProfile);
          await loadFriendAlbum(friendProfile, activePage);
        }
        renderTradePanel();
        if (shouldCloseDetail) closeTradeModal();
        setSaveStatus(status === "accepted" ? "Troca aceite e cadernetas atualizadas" : "Troca atualizada");
      } catch (error) {
        setSaveStatus(error.message);
      }
    }

    function toggleTradesPanel(forceOpen) {
      if (forceOpen === false) {
        showMyAlbum();
        return;
      }

      openTradesPanel();
    }

    function openTradesPanel() {
      openFriendsPage();
      if (hasSelectedFriend()) openSuggestedTrade(50);
    }

    function updateListToolUI() {
      const compareTool = document.getElementById("listCompareTool");
      const compareButton = document.getElementById("listToolCompareButton");
      const addButton = document.getElementById("listToolAddButton");
      const friendButton = document.getElementById("listToolFriendButton");
      compareTool?.classList.toggle("hidden", activeListTool !== "compare");
      bulkAddPanel?.classList.toggle("hidden", activePage !== "compare" || activeListTool !== "add");
      friendListPanel?.classList.toggle("hidden", activePage !== "compare" || activeListTool !== "friend");
      compareButton?.classList.toggle("active", activeListTool === "compare");
      addButton?.classList.toggle("active", activeListTool === "add");
      friendButton?.classList.toggle("active", activeListTool === "friend");
    }

    function setListTool(tool) {
      activeListTool = tool === "add" ? "add" : tool === "friend" ? "friend" : "compare";
      updateListToolUI();
      if (activeListTool === "compare") {
        renderFriendListUserOptions();
        loadLiveProfiles().then(renderFriendListUserOptions).catch(() => {});
        renderListComparison();
        setTimeout(() => listCompareInput?.focus(), 0);
      } else if (activeListTool === "add") {
        renderBulkAddPreview();
        setTimeout(() => bulkAddInput?.focus(), 0);
      } else {
        renderFriendListUserOptions();
        renderFriendListIntro();
        loadLiveProfiles().then(renderFriendListUserOptions).catch(() => {});
        setTimeout(() => friendListInput?.focus(), 0);
      }
    }

    function scheduleTradeOverviewRefresh() {
      clearTimeout(tradeOverviewRefreshTimer);
      tradeOverviewRefreshTimer = setTimeout(() => {
        if (activePage === "friends" && !friendProfile) refreshTradeOverview().catch(() => renderTradeOverview());
      }, 900);
    }

    function getCachedFriendAlbum(profile) {
      const cached = friendAlbumCache.get(profile);
      if (!cached || Date.now() - cached.cachedAt > FRIEND_CACHE_TTL_MS) return null;
      return cached;
    }

    function applyFriendAlbumData(profile, data) {
      friendProfile = profile;
      friendUpdatedAt = data.updatedAt || "";
      friendUserColor = sanitizeUserColor(data.userColor || profileColors[profile] || DEFAULT_USER_COLOR);
      profilePhotos[profile] = data.profilePhoto || profilePhotos[profile] || "";
      friendStickers = data.stickers || [];
    }

    async function fetchFriendAlbumCached(profile, force = false) {
      if (!force) {
        const cached = getCachedFriendAlbum(profile);
        if (cached) return cached;
        if (friendAlbumRequests.has(profile)) return friendAlbumRequests.get(profile);
      }
      const request = fetchLiveState(profile).then(data => {
        const cached = {
          ...data,
          stickers: data.exists && data.csv ? parseTextFile(data.csv) : [],
          cachedAt: Date.now()
        };
        friendAlbumCache.set(profile, cached);
        return cached;
      }).finally(() => friendAlbumRequests.delete(profile));
      friendAlbumRequests.set(profile, request);
      return request;
    }
    function openListComparePanel() {
      activeListTool = "compare";
      switchAppPage("compare");
      setListTool("compare");
    }

    function openBulkAddPanel() {
      activeListTool = "add";
      switchAppPage("compare");
      setListTool("add");
    }

    function openAccountPanel() {
      switchAppPage("account");
      syncThemeControls();
      syncProfilePhotoUI();
      setSettingsMessage(settingsThemeMessage, "");
      setSettingsMessage(settingsProfilePhotoMessage, "");
      setSettingsMessage(settingsPasswordMessage, "");
      setSettingsMessage(settingsBackupMessage, "");
      setTimeout(() => themeColorInput?.focus(), 0);
    }
    function openSettingsPanel() {
      switchAppPage("settings");
      syncThemeControls();
      setSettingsMessage(settingsAppearanceMessage, "");
    }

    function refreshFromUserMenu() {
      closeUserMenu();
      refreshLiveNow({ silent: false, force: true });
    }

    document.addEventListener("click", event => {
      if (userMenu && !userMenu.contains(event.target)) closeUserMenu();
      if (topNotificationsPopover && !topNotificationsPopover.contains(event.target) && !topNotificationButton?.contains(event.target)) closeTopNotifications();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeUserMenu();
        closeTopNotifications();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshLiveNow({ silent: true, force: true });
    });

    window.addEventListener("focus", () => refreshLiveNow({ silent: true, force: true }));
    window.addEventListener("online", () => refreshLiveNow({ silent: true, force: true }));


    function isStandaloneApp() {
      return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
    }

    function updateInstallUi() {
      if (installAppButton) installAppButton.disabled = isStandaloneApp();
      if (installHelpText) {
        installHelpText.textContent = isStandaloneApp()
          ? "A app ja esta instalada neste dispositivo."
          : "No iPhone abre no Safari, carrega em Partilhar e escolhe Adicionar ao ecra principal.";
      }
    }

    async function installPwaApp() {
      closeUserMenu();
      if (isStandaloneApp()) {
        setSaveStatus("A app ja esta instalada");
        setSettingsMessage(settingsBackupMessage, "A app ja esta instalada neste dispositivo.");
        return;
      }
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice.catch(() => null);
        deferredInstallPrompt = null;
        updateInstallUi();
        return;
      }
      const msg = /iphone|ipad|ipod/i.test(navigator.userAgent)
        ? "No iPhone: Safari > Partilhar > Adicionar ao ecra principal."
        : "No browser: abre o menu e escolhe instalar app/adicionar ao ecra principal.";
      setSaveStatus(msg);
      setSettingsMessage(settingsBackupMessage, msg);
      alert(msg);
    }

    async function registerPwaServiceWorker() {
      if (!("serviceWorker" in navigator)) return;
      let reloadingForPwaUpdate = false;

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloadingForPwaUpdate) return;
        reloadingForPwaUpdate = true;
        window.location.reload();
      });

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
        const activateWaitingWorker = () => {
          if (registration.waiting && navigator.serviceWorker.controller) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        };

        activateWaitingWorker();
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        registration.update().catch(() => {});
        window.setInterval(() => registration.update().catch(() => {}), 5 * 60 * 1000);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") registration.update().catch(() => {});
        });
      } catch {}
    }

    function initPwaInstall() {
      window.addEventListener("beforeinstallprompt", event => {
        event.preventDefault();
        deferredInstallPrompt = event;
        updateInstallUi();
      });
      window.addEventListener("appinstalled", () => {
        deferredInstallPrompt = null;
        updateInstallUi();
        setSaveStatus("App instalada com sucesso");
      });
      updateInstallUi();
      registerPwaServiceWorker();
    }

    async function exportFullBackup() {
      closeUserMenu();
      try {
        const response = await apiFetch("/api/live/backup", { cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Nao foi poss\u00edvel criar o backup.");
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        const safeProfile = (liveProfile || "user").replace(/[^a-z0-9_-]/gi, "_");
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = "caderneta-mundial-2026-backup-" + safeProfile + "-" + date + ".json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        setSaveStatus("Backup exportado");
        setSettingsMessage(settingsBackupMessage, "Backup exportado com sucesso.");
      } catch (error) {
        const msg = error?.message || "Nao foi poss\u00edvel exportar o backup.";
        setSaveStatus(msg);
        setSettingsMessage(settingsBackupMessage, msg, true);
      }
    }
    function readInviteToken() {
      const params = new URLSearchParams(window.location.search);
      pendingAppShortcut = String(params.get("app") || "").trim().toLowerCase();
      const fromUrl = params.get("convite") || params.get("invite") || params.get("pin") || "";
      inviteFromCurrentLink = Boolean(fromUrl);

      if (fromUrl) {
        sessionStorage.setItem("caderneta_invite_token", fromUrl);
        params.delete("convite");
        params.delete("invite");
        params.delete("pin");
        const cleanQuery = params.toString();
        const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", cleanUrl);
        return fromUrl;
      }

      localStorage.removeItem("caderneta_invite_token");
      return sessionStorage.getItem("caderneta_invite_token") || "";
    }

    function applyPendingAppShortcut() {
      const shortcut = pendingAppShortcut;
      pendingAppShortcut = "";
      if (!shortcut) return;

      const params = new URLSearchParams(window.location.search);
      params.delete("app");
      const cleanQuery = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`);

      if (shortcut === "repetidos") return openDuplicatesView();
      if (shortcut === "amigos") return openFriendsPage();
      if (shortcut === "trocas") return openTradesPanel();
    }

    function currentAuthMode() {
      if (document.body.classList.contains("auth-mode-password")) return "password";
      if (document.body.classList.contains("auth-mode-register")) return "register";
      if (document.body.classList.contains("auth-mode-login")) return "login";
      return "app";
    }

    function setAuthMode(mode) {
      document.body.classList.toggle("auth-locked", mode !== "app");
      document.body.classList.toggle("auth-mode-login", mode === "login");
      document.body.classList.toggle("auth-mode-register", mode === "register");
      document.body.classList.toggle("auth-mode-password", mode === "password");
      document.body.classList.toggle("auth-mode-denied", mode === "denied");
      if (authGate) authGate.setAttribute("aria-hidden", mode === "app" ? "true" : "false");
    }

    function setAuthMessage(text, mode = currentAuthMode()) {
      if (mode === "register") {
        authRegisterMessage.textContent = text || "";
        return;
      }
      if (mode === "password") {
        authPasswordMessage.textContent = text || "";
        return;
      }
      authLoginMessage.textContent = text || "";
    }

    function liveCredentials(mode = currentAuthMode()) {
      if (mode === "register") {
        return {
          username: cleanLiveProfileName(authRegisterUsernameInput.value),
          password: authRegisterPasswordInput.value,
          inviteToken
        };
      }

      const useGate = document.body.classList.contains("auth-locked");
      const usernameInput = useGate ? authLoginUsernameInput : liveUsernameInput;
      const passwordInput = useGate ? authLoginPasswordInput : livePasswordInput;

      return {
        username: cleanLiveProfileName(usernameInput.value),
        password: passwordInput.value,
        inviteToken
      };
    }

    function togglePasswordVisibility(inputId, button) {
      const input = document.getElementById(inputId);
      if (!input) return;

      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";

      const label = showPassword ? "Esconder password" : "Mostrar password";
      button.setAttribute("aria-label", label);
      button.title = label;
      button.classList.toggle("is-visible", showPassword);
      input.focus();
    }

    function updateLiveLoginUI() {
      const loggedIn = Boolean(liveProfile);

      liveUsernameInput.disabled = loggedIn || !liveEnabled;
      livePasswordInput.disabled = !liveEnabled;
      livePasswordInput.value = loggedIn ? "" : livePasswordInput.value;
      livePasswordInput.classList.toggle("hidden", loggedIn);
      livePasswordInput.closest(".password-field")?.classList.toggle("hidden", loggedIn);
      liveLoginButton.classList.toggle("hidden", loggedIn);
      liveRegisterButton.classList.toggle("hidden", true);
      liveLoginButton.disabled = !liveEnabled || authRequestLocked;
      liveRegisterButton.disabled = true;
      liveLogoutButton.classList.toggle("hidden", !loggedIn);
      if (liveFriendSelect) liveFriendSelect.disabled = !loggedIn;
      if (tradeFriendSelect) tradeFriendSelect.disabled = !loggedIn;

      authLoginUsernameInput.disabled = loggedIn || !liveEnabled;
      authLoginPasswordInput.disabled = loggedIn || !liveEnabled;
      authLoginButton.disabled = !liveEnabled || authRequestLocked;
      authRegisterUsernameInput.disabled = loggedIn || !liveEnabled || !inviteValid;
      authRegisterPasswordInput.disabled = loggedIn || !liveEnabled || !inviteValid;
      authCreateAccountButton.disabled = !liveEnabled || !inviteValid || authRequestLocked;
      if (authPasswordUsernameInput) authPasswordUsernameInput.disabled = !liveEnabled;
      if (authCurrentPasswordInput) authCurrentPasswordInput.disabled = !liveEnabled;
      if (authNewPasswordInput) authNewPasswordInput.disabled = !liveEnabled;
      if (authConfirmPasswordInput) authConfirmPasswordInput.disabled = !liveEnabled;
      if (authChangePasswordButton) authChangePasswordButton.disabled = !liveEnabled || authRequestLocked;

      if (!loggedIn) {
        activePage = "album";
        if (livePanel) livePanel.classList.add("hidden");
        if (tradePanel) tradePanel.classList.add("hidden");
      }
      updateUserMenu();
      updatePageVisibility();
    }

    async function validateInviteToken(token) {
      if (!token) return false;

      const response = await fetch(`/api/auth/invite?convite=${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      return Boolean(response.ok && data.valid);
    }
    async function authRequest(path, payload = {}) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          signal: controller.signal,
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Pedido de login falhou");
        return data;
      } catch (error) {
        if (error?.name === "AbortError") {
          throw new Error("O servidor demorou demasiado a responder. Tenta novamente.");
        }
        if (error instanceof TypeError) {
          throw new Error("Nao foi poss\u00edvel contactar o servidor. Tenta novamente.");
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }

    async function apiFetch(path, options = {}) {
      const response = await fetch(path, {
        credentials: "same-origin",
        ...options
      });
      if (response.status === 401 && liveProfile && !sessionExpiryHandled) {
        sessionExpiryHandled = true;
        endLiveSession("expired");
      }
      return response;
    }

    function beginAuthRequest() {
      if (authRequestLocked) return false;
      authRequestLocked = true;
      updateLiveLoginUI();
      return true;
    }

    function endAuthRequest() {
      authRequestLocked = false;
      updateLiveLoginUI();
    }

    function openPasswordChangeFromLogin() {
      authPasswordUsernameInput.value = cleanLiveProfileName(authLoginUsernameInput.value || liveUsernameInput.value);
      clearPasswordInputs(authCurrentPasswordInput, authNewPasswordInput, authConfirmPasswordInput);
      setAuthMessage("", "login");
      setAuthMessage("", "password");
      setAuthMode("password");
      setTimeout(() => (authPasswordUsernameInput.value ? authCurrentPasswordInput : authPasswordUsernameInput)?.focus(), 0);
    }

    function backToLoginFromPassword() {
      authLoginUsernameInput.value = cleanLiveProfileName(authPasswordUsernameInput.value || authLoginUsernameInput.value);
      clearPasswordInputs(authCurrentPasswordInput, authNewPasswordInput, authConfirmPasswordInput);
      setAuthMessage("", "password");
      setAuthMode("login");
      setTimeout(() => authLoginPasswordInput?.focus(), 0);
    }

    async function changePasswordFromLogin() {
      if (!liveEnabled) return;

      const username = cleanLiveProfileName(authPasswordUsernameInput.value);
      const currentPassword = authCurrentPasswordInput.value;
      const newPassword = authNewPasswordInput.value;
      const confirmPassword = authConfirmPasswordInput.value;
      const validationMessage = validatePasswordChangePayload(username, currentPassword, newPassword, confirmPassword);

      if (validationMessage) {
        setAuthMessage(validationMessage, "password");
        return;
      }
      if (!beginAuthRequest()) return;

      try {
        setAuthMessage("", "password");
        await authRequest("/api/auth/change-password", { username, currentPassword, newPassword });
        authLoginUsernameInput.value = username;
        clearPasswordInputs(authLoginPasswordInput, authCurrentPasswordInput, authNewPasswordInput, authConfirmPasswordInput);
        setAuthMode("login");
        setAuthMessage("Password alterada. Faz login com a nova password.", "login");
        setSaveStatus("Password alterada");
      } catch (error) {
        setAuthMessage(error.message, "password");
        setSaveStatus("Erro ao mudar password");
      } finally {
        endAuthRequest();
      }
    }

    async function changePasswordFromSettings() {
      if (!requireLiveLogin()) return;

      const currentPassword = settingsCurrentPasswordInput.value;
      const newPassword = settingsNewPasswordInput.value;
      const confirmPassword = settingsConfirmPasswordInput.value;
      const validationMessage = validatePasswordChangePayload(liveProfile, currentPassword, newPassword, confirmPassword);

      if (validationMessage) {
        setSettingsMessage(settingsPasswordMessage, validationMessage, true);
        return;
      }

      try {
        if (settingsChangePasswordButton) settingsChangePasswordButton.disabled = true;
        await authRequest("/api/auth/change-password", { currentPassword, newPassword });
        clearPasswordInputs(settingsCurrentPasswordInput, settingsNewPasswordInput, settingsConfirmPasswordInput);
        setSettingsMessage(settingsPasswordMessage, "Password alterada com sucesso.");
        setSaveStatus("Password alterada");
      } catch (error) {
        setSettingsMessage(settingsPasswordMessage, error.message, true);
        setSaveStatus("Erro ao mudar password");
      } finally {
        if (settingsChangePasswordButton) settingsChangePasswordButton.disabled = false;
      }
    }

    async function fetchLiveState(profile = "") {
      const query = profile ? `?profile=${encodeURIComponent(profile)}` : "";
      const response = await apiFetch(`/api/live/state${query}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nao foi poss\u00edvel ler o perfil live");
      return data;
    }


    async function fetchLiveUpdates() {
      const response = await apiFetch("/api/live/updates", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nao foi possivel ler os updates live");
      return data;
    }

    function normalizeLiveProfilePayload(profiles) {
      return (profiles || [])
        .map(item => typeof item === "string" ? { profile: item } : item)
        .filter(item => item && item.profile && item.profile !== liveProfile);
    }

    function applyLiveProfilesFromPayload(rawProfiles, selected = "") {
      const profiles = normalizeLiveProfilePayload(rawProfiles);
      const previousProfiles = new Map(liveProfilesList.map(item => [item.profile, item]));
      liveProfilesList = profiles;
      liveProfilesLoadedAt = Date.now();

      profiles.forEach(item => {
        const previous = previousProfiles.get(item.profile);
        if (previous && item.updatedAt && previous.updatedAt && item.updatedAt !== previous.updatedAt) {
          friendAlbumCache.delete(item.profile);
        }
      });

      profileColors = {};
      profilePhotos = {};
      profiles.forEach(item => {
        profileColors[item.profile] = sanitizeUserColor(item.userColor || DEFAULT_USER_COLOR);
        profilePhotos[item.profile] = item.profilePhoto || "";
      });

      const options = [
        `<option value="">${profiles.length ? "Escolhe um amigo" : "Ainda nao ha amigos live"}</option>`,
        ...profiles.map(item => `<option value="${escapeHTML(item.profile)}">${escapeHTML(item.profile)}</option>`)
      ].join("");

      if (liveFriendSelect) liveFriendSelect.innerHTML = options;
      if (tradeFriendSelect) tradeFriendSelect.innerHTML = options;
      if (profiles.some(item => item.profile === selected)) syncFriendSelects(selected);
      if (activePage === "friends") renderFriendInsights(rankingItemsFromProfiles());
      if (activePage === "compare") renderFriendListUserOptions();
      return profiles;
    }
    async function refreshOwnAlbumState() {
      const data = await fetchLiveState();
      if (data.exists && data.csv) {
        loadStickers(parseTextFile(data.csv));
        liveUpdatedAt = data.updatedAt || liveUpdatedAt;
      }
    }

    async function loadLiveProfiles(force = false) {
      if (!liveEnabled || !liveProfile) return;

      if (!force && liveProfilesList.length && Date.now() - liveProfilesLoadedAt < 60_000) {
        if (activePage === "friends") renderFriendInsights(rankingItemsFromProfiles());
      if (activePage === "compare") renderFriendListUserOptions();
        return;
      }

      const selected = friendProfile || liveFriendSelect?.value || tradeFriendSelect?.value || "";
      const data = await fetchLiveUpdates();
      applyLiveProfilesFromPayload(data.profiles || [], selected);
      if (!liveTradesUpdatedAt && data.tradesUpdatedAt) liveTradesUpdatedAt = data.tradesUpdatedAt;
    }

    async function writeLiveStateNow() {
      if (!liveEnabled || !liveProfile) return;

      setSaveStatus("A sincronizar live...");
      const response = await apiFetch("/api/live/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: stickersToCSV() })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || "Nao foi poss\u00edvel sincronizar live");
      liveUpdatedAt = data.updatedAt || liveUpdatedAt;
      liveStatusText.textContent = "Online sincronizado.";
      setSaveStatus("Online sincronizado");
      loadLiveProfiles().catch(() => {});
    }

    async function writeStickerChangesNow(ids) {
      if (!liveEnabled || !liveProfile || !ids.length) return;
      const byId = new Map(stickers.map(sticker => [sticker.id, sticker]));
      const changes = ids.map(id => byId.get(id)).filter(Boolean).map(sticker => ({
        id: sticker.id,
        tenho: Boolean(sticker.tenho),
        repetidos: normalizeDuplicates(sticker.repetidos),
        reservados: reservedDuplicates(sticker),
        reservas: normalizeReservations(sticker.reservas),
        pendenteReceber: isPendingIncoming(sticker),
        pendenteDe: normalizePendingPerson(sticker.pendenteDe),
        pendenteDesde: isPendingIncoming(sticker) ? String(sticker.pendenteDesde || "") : "",
        pendenteTrocaId: isPendingIncoming(sticker) ? String(sticker.pendenteTrocaId || "") : "",
        pendenteComoRepetido: isPendingIncoming(sticker) && normalizePendingDuplicate(sticker.pendenteComoRepetido),
        rececoesPendentes: incomingReservations(sticker)
      }));
      if (!changes.length) return;
      const response = await apiFetch("/api/live/stickers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nao foi possivel guardar os cromos");
      liveUpdatedAt = data.updatedAt || liveUpdatedAt;
      setSaveStatus(changes.length === 1 ? "Cromo sincronizado" : `${changes.length} cromos sincronizados`);
    }

    async function persistStateNow() {
      if (!liveEnabled || !liveProfile) {
        setSaveStatus(liveEnabled ? "Entra para sincronizar online" : "Online indisponivel");
        return;
      }
      if (persistInFlight) return persistInFlight;
      persistInFlight = (async () => {
        while (fullSyncPending || pendingStickerIds.size) {
          if (fullSyncPending) {
            fullSyncPending = false;
            pendingStickerIds.clear();
            try {
              await writeLiveStateNow();
            } catch (error) {
              fullSyncPending = true;
              throw error;
            }
            continue;
          }
          const batch = [...pendingStickerIds];
          batch.forEach(id => pendingStickerIds.delete(id));
          try {
            await writeStickerChangesNow(batch);
          } catch (error) {
            batch.forEach(id => pendingStickerIds.add(id));
            throw error;
          }
        }
      })().finally(() => { persistInFlight = null; });
      return persistInFlight;
    }

    function requireLiveLogin() {
      if (liveProfile) return true;
      setSaveStatus(liveEnabled ? "Entra para alterar a caderneta" : "Online indisponivel");
      if (liveUsernameInput && !liveUsernameInput.disabled) liveUsernameInput.focus();
      return false;
    }
    function startLiveRefresh() {
      if (liveRefreshTimer) clearInterval(liveRefreshTimer);
      liveRefreshTimer = setInterval(() => refreshLiveNow({ silent: true }), LIVE_REFRESH_MS);
    }

    function stopIdleLogoutTimer() {
      if (!idleLogoutTimer) return;
      clearTimeout(idleLogoutTimer);
      idleLogoutTimer = null;
    }

    function resetIdleLogoutTimer() {
      if (!liveProfile) {
        stopIdleLogoutTimer();
        return;
      }

      stopIdleLogoutTimer();
      idleLogoutTimer = setTimeout(() => {
        logoutLiveAccount("idle");
      }, IDLE_LOGOUT_MS);
    }

    function registerIdleActivityListeners() {
      ["click", "keydown", "input", "scroll", "touchstart"].forEach(eventName => {
        window.addEventListener(eventName, resetIdleLogoutTimer);
      });
    }

    async function finishLiveLogin(user) {
      if (!user?.username) throw new Error("Resposta de login inválida.");

      liveProfile = user.username;
      onlineProfilePhoto = user.profilePhoto || "";
      sessionExpiryHandled = false;
      friendProfile = "";
      friendStickers = [];
      friendUpdatedAt = "";
      if (user.userColor) currentUserColor = sanitizeUserColor(user.userColor);
      liveUsernameInput.value = user.username;
      localStorage.setItem("caderneta_live_profile", user.username);
      clearPasswordInputs(authLoginPasswordInput, authRegisterPasswordInput, livePasswordInput);
      setAuthMode("app");
      updateLiveLoginUI();
      liveStatusText.textContent = "A carregar caderneta online...";
      setSaveStatus("Login concluído. A carregar caderneta...");
      startLiveRefresh();
      resetIdleLogoutTimer();

      try {
        const data = await fetchLiveState();
        if (data.exists && data.csv) {
          loadStickers(parseTextFile(data.csv));
          liveUpdatedAt = data.updatedAt || "";
        } else {
          await loadBaseAlbum();
          await writeLiveStateNow();
        }
        liveStatusText.textContent = "Online ativo.";
        setSaveStatus("Online ligado com sucesso");
      } catch (error) {
        console.error("Login concluido, mas a caderneta nao carregou.", error);
        liveStatusText.textContent = "Sessao iniciada. Nao foi poss\u00edvel carregar a caderneta.";
        setSaveStatus("Login concluído, mas houve um erro ao carregar os cromos");
      }

      await Promise.allSettled([
        loadUserSettings(),
        loadLiveProfiles(),
        loadTradeRequests()
      ]);
      applyPendingAppShortcut();
    }

    async function loginLiveAccount() {
      if (!liveEnabled) return;

      const credentials = liveCredentials("login");
      if (!credentials.username || !credentials.password) {
        setAuthMessage("Escreve username e password", "login");
        setSaveStatus("Escreve username e password");
        return;
      }
      if (!beginAuthRequest()) return;

      try {
        setAuthMessage("", "login");
        const data = await authRequest("/api/auth/login", credentials);
        await finishLiveLogin(data.user);
      } catch (error) {
        setAuthMessage(error.message, "login");
        liveStatusText.textContent = error.message;
        setSaveStatus("Erro no login");
      } finally {
        endAuthRequest();
      }
    }

    async function registerLiveAccount() {
      if (!liveEnabled) return;
      if (!inviteValid || !inviteToken) {
        setAuthMessage("Abre o link de convite para criar conta", "register");
        return;
      }

      const credentials = liveCredentials("register");
      if (!credentials.username || !credentials.password) {
        setAuthMessage("Escolhe username e password", "register");
        setSaveStatus("Escolhe username e password");
        return;
      }

      if (credentials.password.length < 8) {
        setAuthMessage("A password deve ter pelo menos 8 caracteres", "register");
        setSaveStatus("Password demasiado curta");
        return;
      }
      if (!beginAuthRequest()) return;

      try {
        setAuthMessage("", "register");
        const data = await authRequest("/api/auth/register", credentials);
        localStorage.setItem("caderneta_live_profile", credentials.username);
        sessionStorage.removeItem("caderneta_invite_token");
        localStorage.removeItem("caderneta_invite_token");
        inviteToken = "";
        inviteValid = false;
        authLoginUsernameInput.value = credentials.username;
        authLoginPasswordInput.value = "";
        authRegisterPasswordInput.value = "";
        liveUsernameInput.value = credentials.username;
        await finishLiveLogin(data.user);
        setSaveStatus("Conta criada com sucesso");
      } catch (error) {
        setAuthMessage(error.message, "register");
        liveStatusText.textContent = error.message;
        setSaveStatus("Erro ao criar conta");
      } finally {
        endAuthRequest();
      }
    }

    function endLiveSession(reason = "manual") {
      liveProfile = "";
      onlineProfilePhoto = "";
      liveUpdatedAt = "";
      friendProfile = "";
      friendStickers = [];
      friendUpdatedAt = "";
      friendUserColor = DEFAULT_USER_COLOR;
      tradeRequests = [];
      updateTradeBadges();
      if (liveRefreshTimer) clearInterval(liveRefreshTimer);
      liveRefreshTimer = null;
      stopIdleLogoutTimer();
      liveComparison.innerHTML = "";
      if (tradeList) tradeList.innerHTML = "";
      if (tradeSuggestions) tradeSuggestions.innerHTML = "";
      if (tradePanel) tradePanel.classList.add("hidden");
      if (liveFriendSelect) liveFriendSelect.innerHTML = `<option value="">Escolhe um amigo</option>`;
      closeUserMenu();
      const expired = reason === "idle" || reason === "expired";
      liveStatusText.textContent = expired
        ? "Sessao expirada. Entra novamente."
        : "Sessao terminada. Entra para voltar ao modo online.";
      setAuthMode("login");
      updateLiveLoginUI();
      setAuthMessage(expired ? "Sessao expirada. Faz login novamente." : "", "login");
      setSaveStatus(expired ? "Sessao expirada" : "Sessao terminada");
    }

    async function logoutLiveAccount(reason = "manual") {
      if (!liveEnabled) return;

      try {
        await authRequest("/api/auth/logout");
      } catch {}

      endLiveSession(reason);
      sessionExpiryHandled = false;
    }

    async function refreshLiveNow(options = {}) {
      const silent = options.silent !== false;
      const force = Boolean(options.force);
      if (!liveEnabled) return;
      if (!liveProfile) {
        if (!silent) {
          setSaveStatus("Entra no modo online primeiro");
          liveUsernameInput.focus();
        }
        return;
      }
      if (liveRefreshInFlight) return;

      liveRefreshInFlight = true;
      try {
        if (pendingStickerIds.size || fullSyncPending) {
          await persistStateNow();
        }

        const selected = friendProfile || liveFriendSelect?.value || tradeFriendSelect?.value || "";
        const updates = await fetchLiveUpdates();
        const profiles = applyLiveProfilesFromPayload(updates.profiles || [], selected);
        const selectedFriend = hasSelectedFriend() ? friendProfile : "";
        const selectedFriendMeta = selectedFriend ? profiles.find(item => item.profile === selectedFriend) : null;
        const ownChanged = force || Boolean(updates.ownUpdatedAt && updates.ownUpdatedAt !== liveUpdatedAt);
        const friendChanged = Boolean(selectedFriend && activePage === "friends" && (
          force || !friendStickers.length || (selectedFriendMeta?.updatedAt && selectedFriendMeta.updatedAt !== friendUpdatedAt)
        ));
        const tradesChanged = force || !liveTradesUpdatedAt || Boolean(updates.tradesUpdatedAt && updates.tradesUpdatedAt !== liveTradesUpdatedAt);

        if (friendChanged) {
          const data = await fetchFriendAlbumCached(selectedFriend, true);
          applyFriendAlbumData(selectedFriend, data);
          if (!albumCountries().includes(selectedCountry)) selectedCountry = "all";
          if (liveComparison) liveComparison.innerHTML = "";
          render();
          renderTradePanel();
          if (!silent) setSaveStatus(`Caderneta de ${selectedFriend} atualizada`);
        }

        if (ownChanged) {
          const data = await fetchLiveState();
          if (data.exists && data.csv) {
            loadStickers(parseTextFile(data.csv));
            liveUpdatedAt = data.updatedAt || liveUpdatedAt;
            if (activePage === "friends") {
              renderFriendInsights(friendRankingItems.length ? friendRankingItems : rankingItemsFromProfiles());
            } else {
              render();
            }
            renderTradePanel();
            if (!silent) setSaveStatus("Online atualizado");
          }
        }

        if (activePage === "friends" && (ownChanged || friendChanged || force || !tradeOverviewLoadedAt || Date.now() - tradeOverviewLoadedAt > LIVE_REFRESH_MS * 4)) {
          await refreshTradeOverview().catch(() => renderTradeOverview());
        }

        if (tradesChanged) {
          await loadTradeRequests();
          liveTradesUpdatedAt = updates.tradesUpdatedAt || liveTradesUpdatedAt;
        }
      } catch (error) {
        if (!silent) setSaveStatus("Erro ao atualizar live");
        console.error(error);
      } finally {
        liveRefreshInFlight = false;
      }
    }

    function clearLiveComparison() {
      showMyAlbum();
    }

    function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchStartupStatus() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), STARTUP_REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch("/api/auth/status", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal
        });
        if (response.status >= 500) throw new Error("Servidor ainda a acordar");
        if (!response.ok) throw new Error("Sem modo online");
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    }

    async function waitForStartupStatus() {
      for (let attempt = 1; attempt <= STARTUP_MAX_ATTEMPTS; attempt += 1) {
        try {
          if (attempt === 1) setStartupMessage("A acordar o servidor...");
          else if (attempt < 8) setStartupMessage("A ligar ao servidor...");
          else if (attempt < 20) setStartupMessage("O Render ainda esta a acordar...");
          else setStartupMessage("Quase pronto. Continuo a tentar ligar...");
          return await fetchStartupStatus();
        } catch (error) {
          if (attempt >= STARTUP_MAX_ATTEMPTS) throw error;
          await wait(STARTUP_RETRY_DELAY_MS);
        }
      }
      throw new Error("Servidor indisponivel");
    }
    async function initLiveMode() {
      if (!livePanel) return;

      inviteToken = readInviteToken();

      try {
        const data = await waitForStartupStatus();
        liveEnabled = Boolean(data.enabled);
        setStartupMessage("A verificar a tua sessão...");

        const rememberedUser = localStorage.getItem("caderneta_live_profile") || "";
        liveUsernameInput.value = rememberedUser;
        authLoginUsernameInput.value = rememberedUser;
        authRegisterUsernameInput.value = rememberedUser;

        if (!liveEnabled) {
          liveProfile = "";
          inviteValid = false;
          setAuthMode("denied");
          liveStatusText.textContent = "Online indisponivel. Confirma a variavel MONGODB_URI no Render.";
          updateLiveLoginUI();
          setSaveStatus("Online indisponivel");
          hideStartupScreen();
          return;
        }

        if (data.loggedIn && data.user) {
          inviteValid = true;
          setStartupMessage("A carregar a tua caderneta...");
          await finishLiveLogin(data.user);
          hideStartupScreen();
          return;
        }

        inviteValid = await validateInviteToken(inviteToken);
        if (inviteToken && !inviteValid && inviteFromCurrentLink) {
          sessionStorage.removeItem("caderneta_invite_token");
          localStorage.removeItem("caderneta_invite_token");
          inviteToken = "";
          liveProfile = "";
          setAuthMode("denied");
          updateLiveLoginUI();
          setSaveStatus("Acesso bloqueado");
          hideStartupScreen();
          return;
        }

        liveProfile = "";
        if (inviteValid) {
          setAuthMode("register");
          authRegisterStatusText.textContent = "Convite aceite. Cria a tua conta para entrar automaticamente.";
          setAuthMessage("", "register");
          setSaveStatus("Registo por convite");
        } else {
          setAuthMode("login");
          authLoginStatusText.textContent = "Entra com o teu username e password.";
          setAuthMessage("", "login");
          setSaveStatus("Login apenas");
        }
        updateLiveLoginUI();
        hideStartupScreen();
      } catch (error) {
        console.error("Nao foi possivel acordar o servidor.", error);
        setStartupMessage("O servidor ainda nao respondeu. A tentar novamente...");
        setTimeout(() => initLiveMode().catch(() => {}), STARTUP_RETRY_DELAY_MS);
      }
    }
    function updateSearchControls() {
      const hasSearch = Boolean(search?.value?.trim());
      clearSearchButton?.classList.toggle("is-visible", hasSearch);
      if (clearSearchButton) clearSearchButton.disabled = !hasSearch;
    }

    function clearSearch() {
      if (!search?.value) return;
      search.value = "";
      render();
      search?.focus();
    }

    function updateExportSummary() {
      const album = currentAlbumStickers();
      const pendingIncoming = album.filter(sticker => isPendingIncoming(sticker)).length;
      const missing = album.filter(sticker => !sticker.tenho && !isPendingIncoming(sticker)).length;
      const duplicates = album.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const reserved = album.reduce((sum, sticker) => sum + reservedDuplicates(sticker), 0);
      if (exportSummary) {
        const parts = [`${missing} faltam`, `${duplicates} rep.`];
        if (pendingIncoming) parts.push(`${pendingIncoming} a receber`);
        if (reserved) parts.push(`${reserved} reserv.`);
        exportSummary.textContent = parts.join(" - ");
      }
      if (exportListButton) exportListButton.disabled = !album.length;
    }

    function currentCountryLabel() {
      if (selectedCountry === "all") return "todas as seleções";
      const name = countryFullName(selectedCountry);
      return name ? `${name} (${exportGroupLabel(selectedCountry)})` : selectedCountry;
    }

    function updateResultSummary(list) {
      if (resultSummary) resultSummary.textContent = "";
    }

    function emptyActionButtons() {
      const actions = [];
      if (search?.value?.trim()) actions.push(`<button class="empty-action-btn" type="button" onclick="clearSearch()">Limpar pesquisa</button>`);
      if (selectedCountry !== "all") actions.push(`<button class="empty-action-btn" type="button" onclick="setCountry('all')">Ver todas as seleções</button>`);
      if (currentView !== "all") actions.push(`<button class="empty-action-btn" type="button" onclick="setView('all')">Ver todos</button>`);
      return actions.length ? `<div class="empty-actions">${actions.join("")}</div>` : "";
    }

    function renderEmptyState(message, actions = emptyActionButtons()) {
      return `<div class="empty"><strong>${escapeHTML(message)}</strong>${actions}</div>`;
    }
    function updateStats() {
      const album = currentAlbumStickers();
      const total = album.length;
      const owned = album.filter(s => s.tenho).length;
      const missing = total - owned;
      const duplicates = album.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const reserved = album.reduce((sum, sticker) => sum + reservedDuplicates(sticker), 0);

      if (totalCount) totalCount.textContent = total;
      if (ownedCount) ownedCount.textContent = owned;
      if (missingCount) missingCount.textContent = missing;
      if (duplicatesCount) {
        duplicatesCount.textContent = `${duplicates}(${reserved})`;
        duplicatesCount.title = `${duplicates} repetidos livres, ${reserved} guardados`;
        duplicatesCount.setAttribute("aria-label", `${duplicates} repetidos livres e ${reserved} guardados`);
      }
      const percent = total ? Math.round((owned / total) * 100) : 0;
      if (collectionProgressText) collectionProgressText.textContent = percent >= 100 && total ? "Completo" : `${owned}/${total} obtidos - ${percent}%`;
      if (collectionProgressBar) collectionProgressBar.style.width = `${percent}%`;
      updateExportSummary();
    }

    function toggleStickerOwned(stickerId) {
      if (isFriendView()) {
        setSaveStatus(`Estas a ver a caderneta de ${friendProfile}`);
        return;
      }
      const sticker = stickers.find(s => s.id === stickerId);
      if (!sticker) return;
      changeOwned(stickerId, !sticker.tenho);
    }

    function handleStickerCardKey(event, stickerId) {
      const target = event.target;
      if (target && target.closest && target.closest("input, button, .duplicate-controls")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleStickerOwned(stickerId);
    }
    function changeOwned(stickerId, checked) {
      if (isFriendView()) {
        setSaveStatus(`A caderneta de ${friendProfile} e so de leitura`);
        return;
      }
      if (!requireLiveLogin()) return;
      const sticker = stickers.find(s => s.id === stickerId);
      if (!sticker) return;
      if (Boolean(sticker.tenho) === Boolean(checked)) return;

      if (!checked && !confirm(`Confirmas que queres remover o cromo ${sticker.codigo} dos obtidos?`)) {
        render();
        return;
      }

      pushUndoState(checked ? `Colaste ${stickerShortLabel(sticker)}` : `Removeste ${stickerShortLabel(sticker)}`);
      sticker.tenho = checked;
      if (checked) {
        sticker.rececoesPendentes = incomingReservations(sticker).map(item => ({ ...item, asDuplicate: true }));
        syncIncomingReservationLegacy(sticker);
      } else {
        sticker.repetidos = 0;
        sticker.reservados = 0;
        sticker.reservas = [];
        sticker.rececoesPendentes = incomingReservations(sticker).map(item => ({ ...item, asDuplicate: false }));
        syncIncomingReservationLegacy(sticker);
      }
      showStickerToast(sticker, checked ? "owned" : "removed");
      saveState([sticker.id]);
      recordHistory(checked ? `Colado: ${stickerShortLabel(sticker)}` : `Removido: ${stickerShortLabel(sticker)}`, { type: "sticker", action: checked ? "owned_added" : "owned_removed", stickers: [sticker] });
      render();
    }

    function changeDuplicates(stickerId, value) {
      if (isFriendView()) {
        setSaveStatus(`A caderneta de ${friendProfile} e so de leitura`);
        return;
      }
      if (!requireLiveLogin()) return;
      const sticker = stickers.find(s => s.id === stickerId);
      if (!sticker || !sticker.tenho) return;

      const currentDuplicates = normalizeDuplicates(sticker.repetidos);
      const minimumDuplicates = reservedDuplicates(sticker);
      const nextDuplicates = Math.max(minimumDuplicates, normalizeDuplicates(value));
      if (nextDuplicates === currentDuplicates) return;
      pushUndoState(`Repetidos alterados em ${stickerShortLabel(sticker)}`);
      sticker.repetidos = nextDuplicates;
      sticker.reservados = Math.min(reservedDuplicates(sticker), nextDuplicates);
      if (nextDuplicates > currentDuplicates) showStickerToast(sticker, "duplicate-added");
      if (nextDuplicates < currentDuplicates) showStickerToast(sticker, "duplicate-removed");
      saveState([sticker.id]);
      recordHistory(`Repetidos em ${stickerShortLabel(sticker)}: ${currentDuplicates} -> ${nextDuplicates}`, { type: "sticker", action: nextDuplicates > currentDuplicates ? "duplicate_added" : "duplicate_removed", stickers: [sticker] });
      render();
    }

    function adjustDuplicates(stickerId, delta) {
      if (isFriendView()) {
        setSaveStatus(`A caderneta de ${friendProfile} e so de leitura`);
        return;
      }
      if (!requireLiveLogin()) return;
      const sticker = stickers.find(s => s.id === stickerId);
      if (!sticker || !sticker.tenho) return;

      const currentDuplicates = normalizeDuplicates(sticker.repetidos);
      const reserved = reservedDuplicates(sticker);
      if (delta < 0 && currentDuplicates <= 0) return;
      if (delta < 0 && currentDuplicates <= reserved) {
        setSaveStatus(`Este repetido esta guardado. Edita primeiro os guardados de ${stickerShortLabel(sticker)}.`);
        return;
      }
      if (delta < 0 && currentDuplicates === 1 && !confirm(`Confirmas que queres remover o ultimo repetido do cromo ${sticker.codigo}?`)) {
        return;
      }

      pushUndoState(delta > 0 ? `Adicionaste repetido ${stickerShortLabel(sticker)}` : `Retiraste repetido ${stickerShortLabel(sticker)}`);
      sticker.repetidos = Math.max(0, currentDuplicates + delta);
      sticker.reservados = Math.min(reservedDuplicates(sticker), sticker.repetidos);
      showStickerToast(sticker, delta > 0 ? "duplicate-added" : "duplicate-removed");
      saveState([sticker.id]);
      recordHistory(delta > 0 ? `Repetido adicionado: ${stickerShortLabel(sticker)}` : `Repetido retirado: ${stickerShortLabel(sticker)}`, { type: "sticker", action: delta > 0 ? "duplicate_added" : "duplicate_removed", stickers: [sticker] });
      render();
    }

    function adjustReservedDuplicates(stickerId, delta) {
      if (isFriendView()) {
        setSaveStatus(`A caderneta de ${friendProfile} e so de leitura`);
        return;
      }
      if (!requireLiveLogin()) return;
      const sticker = stickers.find(s => s.id === stickerId);
      if (!sticker || !sticker.tenho) return;
      const duplicates = normalizeDuplicates(sticker.repetidos);
      const currentReserved = reservedDuplicates(sticker);
      const nextReserved = Math.max(0, Math.min(duplicates, currentReserved + delta));
      if (nextReserved === currentReserved) return;
      pushUndoState(nextReserved > currentReserved ? `Guardaste ${stickerShortLabel(sticker)} para troca` : `Reativaste ${stickerShortLabel(sticker)}`);
      sticker.reservados = nextReserved;
      saveState([sticker.id]);
      setSaveStatus(nextReserved > currentReserved ? "Cromo guardado para troca" : "Cromo reativado nos repetidos");
      recordHistory(`Guardados em ${stickerShortLabel(sticker)}: ${currentReserved} -> ${nextReserved}`, { type: "sticker", action: nextReserved > currentReserved ? "duplicate_reserved" : "duplicate_unreserved", stickers: [sticker] });
      render();
    }

    function isTeamAlbumSticker(sticker) {
      const name = sticker.nome.trim().toLowerCase();
      return name === "cromo emblema" || name === "cromo equipa" || name === "team logo" || name === "team photo";
    }

    function stickerNumber(sticker) {
      const match = String(sticker.codigo).match(/(\d+)\s*$/);
      return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    }

    function countryStats(country, album = currentAlbumStickers()) {
      const list = album.filter(sticker => sticker.pais === country);
      const total = list.length;
      const owned = list.filter(sticker => sticker.tenho).length;
      const missing = total - owned;
      const duplicates = list.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const percent = total ? Math.round((owned / total) * 100) : 0;
      return { total, owned, missing, duplicates, percent };
    }

    function countryProgressLabel(stats, options = {}) {
      const { compact = true, suffix = "" } = options;
      if (stats.total && stats.percent >= 100) return "Completo";
      const base = `${stats.owned}/${stats.total}`;
      return compact ? `${base} - ${stats.percent}%` : `${base}${suffix} - ${stats.percent}%`;
    }

    function renderCountryCard(country, album = currentAlbumStickers()) {
      const stats = countryStats(country, album);
      const name = countryFullName(country) || country;
      const code = exportGroupLabel(country);

      return `
        <button class="country-card" type="button" style="${countryCardStyle(country)};--progress-width:${stats.percent}%" onclick="openCountryModal('${escapeJS(country)}')">
          <span class="country-card-top">
            <span class="country-card-name">${escapeHTML(name)}</span>
            <span class="country-card-code">${escapeHTML(code)}</span>
          </span>
          <span class="country-card-bottom">
            <span class="country-card-progress" aria-hidden="true"><span></span></span>
            <span class="country-card-count ${stats.percent >= 100 && stats.total ? "is-complete" : ""}">${countryProgressLabel(stats)}</span>
          </span>
        </button>
      `;
    }

    function sortedCountryStickers(list) {
      const term = search.value.trim();
      return [...list].sort((a, b) => {
        const rank = term ? stickerSearchRank(a, term) - stickerSearchRank(b, term) : 0;
        if (rank) return rank;
        return a.codigo.localeCompare(b.codigo, "pt-PT", { numeric: true });
      });
    }

    function renderStickerSections(countryStickers, options = {}) {
      const ordered = sortedCountryStickers(countryStickers);
      const country = ordered[0]?.pais || "";
      if (String(country).startsWith("FWC -")) {
        const firstHistorical = ordered.filter(sticker => {
          const number = stickerNumber(sticker);
          return number >= 9 && number <= 13;
        });
        const secondHistorical = ordered.filter(sticker => {
          const number = stickerNumber(sticker);
          return number >= 14 && number <= 19;
        });

        return [
          firstHistorical.length ? `<div class="sticker-section"><div class="sticker-grid">${firstHistorical.map(sticker => renderStickerCard(sticker, options)).join("")}</div></div>` : "",
          secondHistorical.length ? `<div class="sticker-section"><div class="sticker-grid">${secondHistorical.map(sticker => renderStickerCard(sticker, options)).join("")}</div></div>` : ""
        ].join("");
      }

      const teamStickers = ordered.filter(isTeamAlbumSticker);
      const regularStickers = ordered.filter(sticker => !isTeamAlbumSticker(sticker));
      const firstHalfStickers = regularStickers.filter(sticker => stickerNumber(sticker) <= 10);
      const secondHalfStickers = regularStickers.filter(sticker => stickerNumber(sticker) >= 11);

      return [
        teamStickers.length ? `<div class="sticker-section sticker-section-featured"><div class="sticker-grid">${teamStickers.map(sticker => renderStickerCard(sticker, options)).join("")}</div></div>` : "",
        firstHalfStickers.length ? `<div class="sticker-section"><div class="sticker-grid">${firstHalfStickers.map(sticker => renderStickerCard(sticker, options)).join("")}</div></div>` : "",
        secondHalfStickers.length ? `<div class="sticker-section"><div class="sticker-grid">${secondHalfStickers.map(sticker => renderStickerCard(sticker, options)).join("")}</div></div>` : ""
      ].join("");
    }

    function moveCountryModal(direction) {
      const countries = modalNavigableCountries(currentAlbumStickers());
      if (!countries.length) return;
      const currentIndex = countries.indexOf(selectedCountry);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= countries.length) return;
      selectedCountry = countries[nextIndex];
      countryModalOpen = true;
      render();
      requestAnimationFrame(() => {
        countryModalPanel?.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    function modalNavigableCountries(album = currentAlbumStickers()) {
      const countries = sortedCountriesForList(allCountriesForAlbum(album), album);
      if (countryModalDuplicateOnly || modalView === "duplicates") {
        return countries.filter(country => album.some(sticker => sticker.pais === country && sticker.tenho && availableDuplicates(sticker) > 0));
      }
      if (modalView === "reserved") {
        return countries.filter(country => album.some(sticker => sticker.pais === country && sticker.tenho && reservedDuplicates(sticker) > 0));
      }
      return countries;
    }

    function renderCountryModal() {
      if (!countryModal || !countryModalBody) return;

      if (!countryModalOpen || selectedCountry === "all") {
        countryModal.classList.add("hidden");
        countryModalPanel?.classList.remove("is-duplicate-country-panel");
        countryModal.setAttribute("aria-hidden", "true");
        return;
      }

      const album = currentAlbumStickers();
      let country = selectedCountry;
      const countries = modalNavigableCountries(album);
      if (!countries.includes(country) && (countryModalDuplicateOnly || modalView === "duplicates" || modalView === "reserved")) {
        if (!countries.length) {
          closeCountryModal();
          return;
        }
        country = countries[0];
        selectedCountry = country;
      }
      const countryIndex = countries.indexOf(country);
      const previousCountry = countryIndex > 0 ? countries[countryIndex - 1] : "";
      const nextCountry = countryIndex >= 0 && countryIndex < countries.length - 1 ? countries[countryIndex + 1] : "";
      const stats = countryStats(country, album);
      const name = countryFullName(country) || country;
      const code = exportGroupLabel(country);
      if (countryModalDuplicateOnly && !["duplicates", "reserved"].includes(modalView)) modalView = "duplicates";
      const list = filteredStickers({ country, album, view: modalView });
      const viewCounts = {
        all: album.filter(sticker => sticker.pais === country).length,
        missing: album.filter(sticker => sticker.pais === country && !sticker.tenho).length,
        owned: album.filter(sticker => sticker.pais === country && sticker.tenho).length,
        duplicates: album.filter(sticker => sticker.pais === country && sticker.tenho && availableDuplicates(sticker) > 0).length,
        reserved: album.filter(sticker => sticker.pais === country && sticker.tenho && reservedDuplicates(sticker) > 0).length
      };
      const tabButton = view => `<button type="button" class="${modalView === view ? "active" : ""}" onclick="setModalView('${view}')">${viewTitleText(view)} (${viewCounts[view]})</button>`;

      const duplicateModalMode = countryModalDuplicateOnly || modalView === "duplicates" || modalView === "reserved";
      const modalTabs = countryModalDuplicateOnly
        ? `<div class="country-modal-tabs"><button type="button" class="active">${viewTitleText(modalView)} (${viewCounts[modalView]})</button></div>`
        : `<div class="country-modal-tabs">${["all", "missing", "owned", "duplicates"].map(tabButton).join("")}</div>`;
      countryModal.classList.remove("hidden");
      countryModalPanel?.classList.toggle("is-duplicate-country-panel", countryModalDuplicateOnly);
      countryModal.setAttribute("aria-hidden", "false");
      countryModalBody.innerHTML = `
        <div class="country-modal-inner ${duplicateModalMode ? "is-duplicate-modal" : ""} ${countryModalDuplicateOnly ? "is-duplicate-country-modal" : ""}" style="${sectionStyle(country)}">
          <header class="country-modal-head">
            <div class="country-modal-title-row">
              <div>
                <div class="country-modal-code">${escapeHTML(code)}${isFriendView() ? " - AMIGO" : ""}</div>
                <h2 id="countryModalTitle" class="country-modal-title">${escapeHTML(name)}</h2>
              </div>
              <div class="country-modal-title-actions">
                <button class="country-modal-nav" type="button" onclick="moveCountryModal(-1)" aria-label="Selecao anterior" ${previousCountry ? "" : "disabled"}>< ${escapeHTML(previousCountry ? exportGroupLabel(previousCountry) : "")}</button>
                <button class="country-modal-nav" type="button" onclick="moveCountryModal(1)" aria-label="Selecao seguinte" ${nextCountry ? "" : "disabled"}>${escapeHTML(nextCountry ? exportGroupLabel(nextCountry) : "")} ></button>
                <button class="country-modal-close" type="button" onclick="closeCountryModal()" aria-label="Fechar">x</button>
              </div>
            </div>
            <div class="country-count ${stats.percent >= 100 && stats.total ? "is-complete" : ""}">${countryProgressLabel(stats, { compact: false, suffix: " obtidos" })}</div>
            <div class="country-progress" aria-hidden="true">
              <div class="country-progress-bar" style="--progress-width:${stats.percent}%"></div>
            </div>
            ${modalTabs}
          </header>
          <div class="country-modal-content">
            ${list.length ? `<div class="stickers">${renderStickerSections(list, { duplicatePalette: duplicateModalMode, noToggle: duplicateModalMode })}</div>` : renderEmptyState(emptyViewMessage(modalView, country), "")}
          </div>
        </div>
      `;
    }

    function renderDuplicatePanel(sticker, stickerId, readonly) {
      const available = availableDuplicates(sticker);
      const total = normalizeDuplicates(sticker.repetidos);
      const reserved = reservedDuplicates(sticker);
      const visibleUnits = modalView === "reserved" ? reserved : available;
      if (!visibleUnits) return "";
      const controls = readonly ? "" : `
        <span class="duplicate-buttons" style="${duplicateInputStyle(sticker.pais)}">
          <button class="duplicate-control-btn" type="button" onclick="event.stopPropagation(); adjustDuplicates('${stickerId}', -1)" title="Remover repetido">-</button>
          <button class="duplicate-control-btn" type="button" onclick="event.stopPropagation(); adjustDuplicates('${stickerId}', 1)" title="Adicionar repetido">+</button>
        </span>`;
      return `
        <div class="duplicate-row duplicate-row-compact" onclick="event.stopPropagation()">
          <span class="duplicate-summary">
            Unidades: <span class="duplicate-summary-count">${total}</span>
            <small>${available} livres${reserved ? ` · ${reserved} reservadas` : ""}</small>
          </span>
          ${controls}
        </div>
      `;
    }
    function renderOwnedDuplicateControls(sticker, stickerId, readonly) {
      if (readonly || !sticker.tenho) return "";
      const total = normalizeDuplicates(sticker.repetidos);
      const available = availableDuplicates(sticker);
      const reserved = reservedDuplicates(sticker);
      return `
        <div class="duplicate-row owned-duplicate-row" onclick="event.stopPropagation()">
          <span class="duplicate-summary">
            Unidades repetidas: <span class="duplicate-summary-count">${total}</span>
            <small>${available} livres${reserved ? ` · ${reserved} reservadas` : ""}</small>
          </span>
          <span class="duplicate-buttons" style="${duplicateInputStyle(sticker.pais)}">
            <button class="duplicate-control-btn" type="button" onclick="event.stopPropagation(); adjustDuplicates('${stickerId}', -1)" title="Remover repetido" ${total ? "" : "disabled"}>-</button>
            <button class="duplicate-control-btn" type="button" onclick="event.stopPropagation(); adjustDuplicates('${stickerId}', 1)" title="Adicionar repetido">+</button>
          </span>
        </div>
      `;
    }
    function renderStickerCard(sticker, options = {}) {
      const stickerId = escapeJS(sticker.id);
      const readonly = isFriendView();
      const pendingIncoming = !readonly && isPendingIncoming(sticker);
      const pendingReceipts = pendingIncoming ? incomingReservations(sticker) : [];
      const duplicateUnits = normalizeDuplicates(sticker.repetidos);
      const freeDuplicateUnits = availableDuplicates(sticker);
      const reservedDuplicateUnits = reservedDuplicates(sticker);
      const visibleDuplicateUnits = options.duplicatePalette && modalView === "reserved" ? reservedDuplicateUnits : freeDuplicateUnits;
      const duplicateStateLabel = visibleDuplicateUnits > 0 ? `x${visibleDuplicateUnits}` : "✓";
      const showDuplicateBadge = sticker.tenho && visibleDuplicateUnits > 1 && (currentView === "duplicates" || options.duplicatePalette);
      const pendingLabel = pendingReceipts.length > 1
        ? `${pendingReceipts.length} trocas pendentes`
        : `${normalizePendingDuplicate(pendingReceipts[0]?.asDuplicate) ? "Repetido a receber" : "A receber"} de ${normalizePendingPerson(pendingReceipts[0]?.person) || "alguem"}`;
      const cardStyle = `${checkboxStyle(sticker.pais)}${options.duplicatePalette ? `;${duplicateStickerStyle(sticker.pais)}` : ""}`;
      const lockToggle = readonly || options.noToggle;
      return `
        <div
          class="sticker ${sticker.tenho ? "is-owned" : ""} ${duplicateUnits > 0 ? "has-duplicate-units" : ""} ${pendingIncoming ? "is-pending-incoming" : ""} ${lockToggle ? "is-readonly" : ""}"
          style="${cardStyle}"
          role="${lockToggle ? "group" : "checkbox"}"
          ${lockToggle ? `aria-label="${readonly ? `Cromo de ${escapeHTML(friendProfile)}` : "Cromo repetido"}"` : `aria-checked="${sticker.tenho ? "true" : "false"}" tabindex="0" onclick="toggleStickerOwned('${stickerId}')" onkeydown="handleStickerCardKey(event, '${stickerId}')"`}
          title="${lockToggle ? "Ajusta os repetidos nos botoes" : (sticker.tenho ? "Remover dos obtidos" : "Marcar como obtido")}"
        >
          <div class="sticker-state" aria-hidden="true">${sticker.tenho ? `<span>${escapeHTML(duplicateStateLabel)}</span>` : ""}</div>
          ${showDuplicateBadge ? `<span class="duplicate-unit-badge" aria-label="${visibleDuplicateUnits} unidades ${modalView === "reserved" ? "guardadas" : "livres"}">x${visibleDuplicateUnits}</span>` : ""}
          <div class="sticker-info">
            <div class="code">
              ${escapeHTML((currentView === "duplicates" || options.duplicatePalette) ? `${exportGroupLabel(sticker.pais)} ${stickerExportNumber(sticker)}` : sticker.codigo)}
            </div>
            <div class="name">${escapeHTML(sticker.nome)}</div>
            ${pendingIncoming ? `<div class="pending-incoming-badge">${escapeHTML(pendingLabel)}</div>` : ""}
            ${sticker.tenho && options.duplicatePalette ? renderDuplicatePanel(sticker, stickerId, readonly) : renderOwnedDuplicateControls(sticker, stickerId, readonly)}
          </div>
        </div>
      `;
    }

    function stickerMatchesCurrentView(sticker) {
      return currentView === "all" ||
        (currentView === "missing" && !sticker.tenho) ||
        (currentView === "owned" && sticker.tenho) ||
        (currentView === "duplicates" && sticker.tenho && availableDuplicates(sticker) > 0);
    }

    function renderSearchStickerResults(list) {
      return `
        <section class="search-results" aria-label="Cromos encontrados">
          <div class="search-results-title">Cromos encontrados</div>
          <div class="sticker-grid">${list.map(renderStickerCard).join("")}</div>
        </section>
      `;
    }

    function renderSearchResults(countryMatches, stickerMatches, term, album) {
      const countryBlock = countryMatches.length ? `
        <section class="search-result-block" aria-label="Sele\u00e7\u00f5es encontradas">
          <div class="search-results-title">Sele\u00e7\u00f5es encontradas</div>
          <div class="search-country-strip">${countryMatches.map(country => renderCountryCard(country, album)).join("")}</div>
        </section>
      ` : "";
      const stickerBlock = stickerMatches.length ? renderSearchStickerResults(stickerMatches) : "";
      if (countryBlock && stickerBlock) return `${countryBlock}<section class="search-result-block"><div class="search-results-note">Cromos encontrados pelo nome ou c\u00f3digo exato</div>${stickerBlock}</section>`;
      return countryBlock || stickerBlock || renderEmptyState(`N\u00e3o h\u00e1 resultados para ${term}.`);
    }

    function duplicateCountryStats(country, list, mode = "available") {
      const countryList = list.filter(sticker => sticker.pais === country);
      const total = countryList.reduce((sum, sticker) => sum + normalizeDuplicates(sticker.repetidos), 0);
      const available = countryList.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const reserved = countryList.reduce((sum, sticker) => sum + reservedDuplicates(sticker), 0);
      const previewSource = countryList
        .filter(sticker => mode === "reserved" ? reservedDuplicates(sticker) > 0 : availableDuplicates(sticker) > 0)
        .slice()
        .sort((a, b) => stickerNumber(a) - stickerNumber(b));
      const preview = previewSource.slice(0, 8).map(sticker => {
        const count = mode === "reserved" ? reservedDuplicates(sticker) : availableDuplicates(sticker);
        return count > 1 ? `${stickerExportNumber(sticker)} x${count}` : stickerExportNumber(sticker);
      });
      return { total, available, reserved, unique: previewSource.length, preview };
    }

    function openCountryDuplicatesModal(country, mode = "duplicates") {
      selectedCountry = country;
      countryModalDuplicateOnly = true;
      modalView = mode;
      countryModalOpen = true;
      document.body.classList.add("modal-open");
      render();
    }

    function renderDuplicateCountryCard(country, list, mode = "available") {
      const stats = duplicateCountryStats(country, list, mode);
      const name = countryFullName(country) || country;
      const code = exportGroupLabel(country);
      const amount = mode === "reserved" ? stats.reserved : stats.available;
      const label = mode === "reserved" ? "Guardados" : "Repetidos";
      const preview = stats.preview.length ? stats.preview.join(", ") + (stats.unique > stats.preview.length ? "..." : "") : "Sem cromos";
      const openMode = mode === "reserved" ? "reserved" : "duplicates";
      return `
        <button class="duplicate-country-card ${mode === "reserved" ? "is-reserved" : ""}" type="button" style="${countryCardStyle(country)}" onclick="openCountryDuplicatesModal('${escapeJS(country)}', '${openMode}')">
          <span class="duplicate-country-head">
            <strong>${escapeHTML(name)}</strong>
            <span>${escapeHTML(code)}</span>
          </span>
          <span class="duplicate-country-counts">
            <span><b>${amount}</b>${label}</span>
          </span>
          <span class="duplicate-country-preview">${escapeHTML(preview)}</span>
        </button>
      `;
    }

    function renderDuplicateCountrySection(title, emptyText, countries, list, mode) {
      if (!countries.length) return `
        <section class="duplicate-section">
          <div class="duplicate-section-title"><span>${escapeHTML(title)}</span><small>0</small></div>
          <div class="comparison-empty">${escapeHTML(emptyText)}</div>
        </section>
      `;
      const orderedCountries = sortedCountriesForList(countries.slice(), list);
      let previousGroup = "";
      const cards = orderedCountries.map(country => {
        if (duplicateGroupingMode === "flat") return renderDuplicateCountryCard(country, list, mode);
        const group = officialGroupForCountry(country);
        const heading = group !== previousGroup ? `<div class="country-group-title">${escapeHTML(group)}</div>` : "";
        previousGroup = group;
        return `${heading}${renderDuplicateCountryCard(country, list, mode)}`;
      }).join("");
      return `
        <section class="duplicate-section">
          <div class="duplicate-section-title"><span>${escapeHTML(title)}</span><small>${countries.length} selecoes</small></div>
          <div class="duplicate-country-grid duplicate-country-grid-grouped">${cards}</div>
        </section>
      `;
    }
    function reservationDateValue(value) {
      const time = Date.parse(value || "");
      return Number.isFinite(time) ? time : Date.now();
    }

    function reservationDateLabel(value) {
      const date = new Date(`${reservationDateKey(value)}T12:00:00`);
      if (!Number.isFinite(date.getTime())) return reservationDateKey(value);
      const dayMonth = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit" }).format(date);
      const weekday = new Intl.DateTimeFormat("pt-PT", { weekday: "long" }).format(date);
      return `${dayMonth} - ${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;
    }
    function reservationDateKey(value) {
      const text = String(value || "").trim();
      const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
      return match ? match[1] : new Date().toISOString().slice(0, 10);
    }

    function createReservedTradeId() {
      if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
      return `troca-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function legacyReservedTradeId(person, date) {
      return `legacy:${normalizeReservationPerson(person)}:${reservationDateKey(date)}`;
    }

    function groupedReservedTrades(album = currentAlbumStickers()) {
      const groups = new Map();
      album.forEach(sticker => {
        normalizeReservations(sticker.reservas).forEach(reservation => {
          const person = normalizeReservationPerson(reservation.person);
          const date = reservationDateKey(reservation.createdAt);
          const tradeId = reservation.tradeId || legacyReservedTradeId(person, date);
          if (!groups.has(tradeId)) groups.set(tradeId, { id: tradeId, person, date, give: [], receive: [] });
          groups.get(tradeId).give.push({ sticker, count: reservation.count, person, createdAt: date });
        });
        incomingReservations(sticker).forEach(receipt => {
          const person = normalizeReservationPerson(receipt.person);
          const date = reservationDateKey(receipt.agreedDate);
          const tradeId = receipt.tradeId;
          if (!groups.has(tradeId)) groups.set(tradeId, { id: tradeId, person, date, give: [], receive: [] });
          groups.get(tradeId).receive.push({
            sticker,
            count: receipt.count,
            person,
            createdAt: date,
            asDuplicate: normalizePendingDuplicate(receipt.asDuplicate)
          });
        });
      });
      return [...groups.values()].map(group => ({
        ...group,
        give: group.give.sort((a, b) => albumCountries().indexOf(a.sticker.pais) - albumCountries().indexOf(b.sticker.pais) || stickerNumber(a.sticker) - stickerNumber(b.sticker)),
        receive: group.receive.sort((a, b) => albumCountries().indexOf(a.sticker.pais) - albumCountries().indexOf(b.sticker.pais) || stickerNumber(a.sticker) - stickerNumber(b.sticker))
      })).sort((a, b) => reservationDateValue(a.date) - reservationDateValue(b.date) || a.person.localeCompare(b.person, "pt-PT", { sensitivity: "base" }));
    }

    function renderReservationForm() {
      const today = new Date().toISOString().slice(0, 10);
      return `
        <section class="duplicate-reserve-box">
          <div class="duplicate-section-title"><span>${editingReservedTradeId ? "Editar troca reservada" : "Nova troca reservada"}</span><small>pendente</small></div>
          <div class="reserve-identity-grid">
            <input id="reservePersonInput" class="live-input" type="text" maxlength="40" placeholder="Nome da pessoa" />
            <label class="reserve-date-field" onclick="openReserveDatePicker(event)">
              <span>Data em que combinaram</span>
              <input id="reserveDateInput" class="live-input" type="date" value="${today}" />
              <small>Clica para escolher o dia no calendário.</small>
            </label>
          </div>
          <div class="reserve-exchange-grid">
            <label>
              <strong>Cromos que vais dar</strong>
              <small>Saem dos teus repetidos livres.</small>
              <textarea id="reserveGiveListInput" class="list-compare-input reserve-list-input" spellcheck="false" placeholder="Ex.:\nPOR: 3, 8\nCOL: 16"></textarea>
            </label>
            <label>
              <strong>Cromos que vais receber</strong>
              <small>A app separa automaticamente os novos dos que entram como repetidos.</small>
              <textarea id="reserveReceiveListInput" class="list-compare-input reserve-list-input" spellcheck="false" oninput="renderReservedReceivePreview()" placeholder="Ex.:\nARG: 4, 12\nESP: 7"></textarea>
              <div id="reserveReceivePreview" class="reserve-receive-preview"></div>
            </label>
          </div>
          <div class="list-compare-actions">
            <button type="button" onclick="reserveTrade()">${editingReservedTradeId ? "Guardar alterações" : "Guardar troca reservada"}</button>
            <button class="secondary" type="button" onclick="clearReserveForm()">Limpar</button>
          </div>
          <div id="reserveListResult" class="list-compare-result"></div>
        </section>
      `;
    }

    function openReserveDatePicker(event) {
      const input = document.getElementById("reserveDateInput");
      if (!input) return;
      if (event?.target !== input) input.focus();
      if (typeof input.showPicker === "function") {
        try { input.showPicker(); } catch {}
      }
    }

    function renderReservedReceivePreview() {
      const input = document.getElementById("reserveReceiveListInput");
      const preview = document.getElementById("reserveReceivePreview");
      if (!preview) return;
      const raw = input?.value || "";
      if (!raw.trim()) {
        preview.innerHTML = "";
        return;
      }

      const parsed = parsePastedStickerList(raw);
      const { toCollect, asDuplicates } = splitIncomingEntries(parsed.entries);
      const total = entries => entries.reduce((sum, entry) => sum + Math.max(1, entry.count || 1), 0);
      const lines = entries => groupedListFromEntries(entries, entry => formatCountedSticker(entry, entry.count));

      preview.innerHTML = `
        <div class="reserve-receive-preview-head">
          <strong>Leitura automática da tua caderneta</strong>
          <small>${total(parsed.entries)} cromos reconhecidos</small>
        </div>
        <div class="reserve-receive-preview-grid">
          <article>
            <strong>Para colar: ${total(toCollect)}</strong>
            ${toCollect.length ? `<div class="comparison-lines">${lines(toCollect).map(escapeHTML).join("<br>")}</div>` : `<small>Nenhum cromo novo.</small>`}
          </article>
          <article>
            <strong>Como repetidos: ${total(asDuplicates)}</strong>
            ${asDuplicates.length ? `<div class="comparison-lines">${lines(asDuplicates).map(escapeHTML).join("<br>")}</div>` : `<small>Nenhum repetido.</small>`}
          </article>
        </div>
        ${parsed.unknown.length ? `<small class="reserve-receive-warning">Não reconhecidos: ${escapeHTML(parsed.unknown.slice(0, 10).join(", "))}</small>` : ""}
      `;
    }

    function reservedTradeListText(entries) {
      const expanded = [];
      (entries || []).forEach(entry => {
        const count = Math.max(1, normalizeDuplicates(entry.count || 1));
        for (let index = 0; index < count; index += 1) expanded.push(entry.sticker);
      });
      return exportGroupedLines(expanded, sticker => stickerExportNumber(sticker)).join("\n");
    }

    function populateReservedTradeForm(tradeId) {
      const trade = groupedReservedTrades(stickers).find(item => item.id === tradeId);
      if (!trade) return;
      const person = document.getElementById("reservePersonInput");
      const date = document.getElementById("reserveDateInput");
      const give = document.getElementById("reserveGiveListInput");
      const receive = document.getElementById("reserveReceiveListInput");
      if (person) person.value = trade.person;
      if (date) date.value = trade.date;
      if (give) give.value = reservedTradeListText(trade.give);
      if (receive) receive.value = reservedTradeListText(trade.receive);
      renderReservedReceivePreview();
    }

    function openReserveModal(tradeId = "") {
      if (isFriendView()) return setSaveStatus(`A caderneta de ${friendProfile} e so de leitura`);
      if (!requireLiveLogin()) return;
      editingReservedTradeId = String(tradeId || "").trim();
      reserveModalOpen = true;
      document.body.classList.add("modal-open");
      renderReserveModal();
      if (editingReservedTradeId) populateReservedTradeForm(editingReservedTradeId);
    }

    function closeReserveModal() {
      reserveModalOpen = false;
      editingReservedTradeId = "";
      reserveModal?.classList.add("hidden");
      reserveModal?.setAttribute("aria-hidden", "true");
      if (!countryModalOpen && !tradeModalOpen) document.body.classList.remove("modal-open");
    }

    function renderReserveModal() {
      if (!reserveModal || !reserveModalBody) return;
      if (!reserveModalOpen) {
        reserveModal.classList.add("hidden");
        reserveModal.setAttribute("aria-hidden", "true");
        return;
      }
      reserveModal.classList.remove("hidden");
      reserveModal.setAttribute("aria-hidden", "false");
      reserveModalBody.innerHTML = `
        <div class="trade-modal-head">
          <div>
            <h2>Troca reservada</h2>
            <p>Regista o que vais dar e receber sem marcar antecipadamente os cromos como obtidos.</p>
          </div>
          <button class="trade-modal-close secondary" type="button" onclick="closeReserveModal()" aria-label="Fechar">x</button>
        </div>
        <div class="reserve-modal-body">
          ${renderReservationForm()}
        </div>
      `;
      setTimeout(() => document.getElementById("reservePersonInput")?.focus(), 0);
    }

    function setDuplicateViewMode(mode) {
      duplicateViewMode = mode === "reserved" ? "reserved" : "available";
      render();
    }

    function setDuplicateGroupingMode(mode) {
      duplicateGroupingMode = mode === "flat" ? "flat" : "groups";
      localStorage.setItem("caderneta_duplicate_grouping", duplicateGroupingMode);
      render();
    }

    function renderDuplicateFilterToolbar(availableCount, reservedCount) {
      return `
        <div class="duplicate-results-toolbar">
          <div class="duplicate-filter-tabs" role="tablist" aria-label="Filtro de cromos repetidos">
            <button type="button" class="${duplicateViewMode === "available" ? "active" : ""}" onclick="setDuplicateViewMode('available')">Repetidos <small>${availableCount}</small></button>
            <button type="button" class="${duplicateViewMode === "reserved" ? "active" : ""}" onclick="setDuplicateViewMode('reserved')">Trocas reservadas <small>${reservedCount}</small></button>
          </div>
          ${duplicateViewMode === "available" ? `
            <div class="duplicate-layout-tabs" role="group" aria-label="Organizacao dos repetidos">
              <button type="button" class="${duplicateGroupingMode === "groups" ? "active" : ""}" onclick="setDuplicateGroupingMode('groups')">Agrupados</button>
              <button type="button" class="${duplicateGroupingMode === "flat" ? "active" : ""}" onclick="setDuplicateGroupingMode('flat')">Sem grupos</button>
            </div>
          ` : ""}
          <button type="button" onclick="openReserveModal()">Nova troca reservada</button>
        </div>
      `;
    }
    function renderReservedMiniCard(entry, direction) {
      const sticker = entry.sticker;
      const stripBg = countrySecondaryColor(sticker.pais).toLowerCase();
      return `
        <article class="reserved-mini-card reserved-mini-card-${direction}" style="${duplicateStickerStyle(sticker.pais)};${checkboxStyle(sticker.pais)};--reserved-strip-bg:${stripBg}">
          <strong>${escapeHTML(stickerShortLabel(sticker))}</strong>
          <span>${escapeHTML(sticker.nome)}</span>
        </article>
      `;
    }

    function expandReservedEntries(entries) {
      return entries.flatMap(entry => {
        const count = Math.max(1, normalizeDuplicates(entry.count));
        return Array.from({ length: count }, () => ({ ...entry, count: 1 }));
      });
    }

    function renderReservedGroups(album = currentAlbumStickers()) {
      const groups = groupedReservedTrades(album);
      if (!groups.length) return `<div class="comparison-empty">Nao tens trocas reservadas.</div>`;
      return groups.map(group => {
        const { toCollect: newStickers, asDuplicates: duplicateStickers } = splitIncomingEntries(group.receive);
        const giveCards = expandReservedEntries(group.give);
        const newStickerCards = expandReservedEntries(newStickers);
        const duplicateStickerCards = expandReservedEntries(duplicateStickers);
        const receiveTotal = group.receive.reduce((sum, entry) => sum + entry.count, 0);
        return `
        <details class="reserved-person-section">
          <summary class="reserved-person-bar">
            <span>Troca com: <strong>${escapeHTML(group.person)}</strong></span>
            <small>${escapeHTML(reservationDateLabel(group.date))}</small>
            <span class="reserved-drop-indicator" aria-hidden="true"></span>
          </summary>
          <div class="reserved-person-body">
            <div class="reserved-trade-sides">
              <div class="reserved-trade-side">
                <strong>Vais dar: ${group.give.reduce((sum, entry) => sum + entry.count, 0)}</strong>
                <div class="reserved-mini-grid">${giveCards.length ? giveCards.map(entry => renderReservedMiniCard(entry, "give")).join("") : `<small class="reserved-trade-empty">Sem cromos registados.</small>`}</div>
              </div>
              <div class="reserved-trade-side reserved-trade-receive-side">
                <strong>Vais receber: ${receiveTotal}</strong>
                <span class="reserved-trade-subtitle">Para colar: ${newStickers.reduce((sum, entry) => sum + entry.count, 0)}</span>
                <div class="reserved-mini-grid">${newStickerCards.length ? newStickerCards.map(entry => renderReservedMiniCard(entry, "receive")).join("") : `<small class="reserved-trade-empty">Sem cromos novos.</small>`}</div>
                <span class="reserved-trade-subtitle">Como repetidos: ${duplicateStickers.reduce((sum, entry) => sum + entry.count, 0)}</span>
                <div class="reserved-mini-grid">${duplicateStickerCards.length ? duplicateStickerCards.map(entry => renderReservedMiniCard(entry, "receive-duplicate")).join("") : `<small class="reserved-trade-empty">Sem repetidos a receber.</small>`}</div>
              </div>
            </div>
            <div class="reserved-person-actions">
              <button class="secondary" type="button" onclick="openReserveModal('${escapeJS(group.id)}')">Editar</button>
              <button type="button" onclick="finishReservedTrade('${escapeJS(group.id)}', 'completed')">Concluir troca</button>
              <button class="secondary" type="button" onclick="finishReservedTrade('${escapeJS(group.id)}', 'cancelled')">Cancelar troca</button>
            </div>
          </div>
        </details>
      `;
      }).join("");
    }
    function clearReserveForm() {
      const person = document.getElementById("reservePersonInput");
      const date = document.getElementById("reserveDateInput");
      const giveList = document.getElementById("reserveGiveListInput");
      const receiveList = document.getElementById("reserveReceiveListInput");
      const result = document.getElementById("reserveListResult");
      if (person) person.value = "";
      if (date) date.value = new Date().toISOString().slice(0, 10);
      if (giveList) giveList.value = "";
      if (receiveList) receiveList.value = "";
      if (result) result.innerHTML = "";
      renderReservedReceivePreview();
      person?.focus();
    }

    function expandReservedHistoryEntries(entries) {
      return (Array.isArray(entries) ? entries : []).flatMap(entry => {
        const count = Math.max(1, Number(entry?.count || 1));
        return Array.from({ length: count }, () => entry.sticker);
      }).filter(Boolean);
    }
    async function reserveTrade() {
      if (isFriendView()) return setSaveStatus(`A caderneta de ${friendProfile} e so de leitura`);
      if (!requireLiveLogin()) return;
      const personInput = document.getElementById("reservePersonInput");
      const dateInput = document.getElementById("reserveDateInput");
      const giveListInput = document.getElementById("reserveGiveListInput");
      const receiveListInput = document.getElementById("reserveReceiveListInput");
      const result = document.getElementById("reserveListResult");
      const person = normalizeReservationPerson(personInput?.value);
      const agreedDate = reservationDateKey(dateInput?.value);
      const rawGiveList = giveListInput?.value || "";
      const rawReceiveList = receiveListInput?.value || "";
      if (!person || person === "Sem nome") {
        if (result) result.innerHTML = `<article class="list-compare-card"><h2>Falta o nome</h2><small>Escreve para quem vais guardar estes cromos.</small></article>`;
        personInput?.focus();
        return;
      }
      if (!rawGiveList.trim() || !rawReceiveList.trim()) {
        if (result) result.innerHTML = `<article class="list-compare-card"><h2>Falta uma das listas</h2><small>Indica os cromos que vais dar e os que vais receber.</small></article>`;
        (!rawGiveList.trim() ? giveListInput : receiveListInput)?.focus();
        return;
      }
      const parsedGive = parsePastedStickerList(rawGiveList);
      const parsedReceive = parsePastedStickerList(rawReceiveList);
      const tradeId = editingReservedTradeId || createReservedTradeId();
      const previouslyAffectedIds = new Set();
      const giveEntries = [];
      const receiveEntries = [];
      parsedGive.entries.forEach(entry => {
        const sticker = stickers.find(item => item.id === entry.sticker.id);
        if (!sticker || !sticker.tenho) return;
        syncStickerReservations(sticker);
        const alreadyInThisTrade = normalizeReservations(sticker.reservas)
          .filter(item => (item.tradeId || legacyReservedTradeId(item.person, item.createdAt)) === tradeId)
          .reduce((sum, item) => sum + item.count, 0);
        const amount = Math.min(Math.max(1, entry.count || 1), availableDuplicates(sticker) + alreadyInThisTrade);
        if (!amount) return;
        giveEntries.push({ sticker, count: amount });
      });
      parsedReceive.entries.forEach(entry => {
        const sticker = stickers.find(item => item.id === entry.sticker.id);
        if (!sticker) return;
        const existingReceipt = incomingReservations(sticker).find(item => item.tradeId === tradeId);
        const asDuplicate = existingReceipt
          ? normalizePendingDuplicate(existingReceipt.asDuplicate)
          : Boolean(sticker.tenho);
        receiveEntries.push({ sticker, count: Math.max(1, entry.count || 1), asDuplicate });
      });
      if (!giveEntries.length || !receiveEntries.length) {
        if (result) result.innerHTML = `<article class="list-compare-card"><h2>Nao foi possivel criar a troca</h2><small>Confirma se os cromos a dar estao nos repetidos livres e se as duas listas foram reconhecidas.</small></article>`;
        return;
      }

      if (editingReservedTradeId) {
        stickers.forEach(sticker => {
          const hadReservation = normalizeReservations(sticker.reservas).some(item =>
            (item.tradeId || legacyReservedTradeId(item.person, item.createdAt)) === tradeId
          );
          const hadIncoming = incomingReservations(sticker).some(item => item.tradeId === tradeId);
          if (hadReservation || hadIncoming) previouslyAffectedIds.add(sticker.id);
          sticker.reservas = normalizeReservations(sticker.reservas).filter(item =>
            (item.tradeId || legacyReservedTradeId(item.person, item.createdAt)) !== tradeId
          );
          sticker.reservados = reservationTotal(sticker);
          syncStickerReservations(sticker);
          sticker.rececoesPendentes = incomingReservations(sticker).filter(item => item.tradeId !== tradeId);
          syncIncomingReservationLegacy(sticker);
        });
      }

      giveEntries.forEach(entry => {
        entry.sticker.reservas = normalizeReservations(entry.sticker.reservas);
        entry.sticker.reservas.push({ person, count: entry.count, createdAt: agreedDate, tradeId });
        syncStickerReservations(entry.sticker);
      });
      receiveEntries.forEach(entry => {
        entry.sticker.rececoesPendentes = incomingReservations(entry.sticker).filter(item => item.tradeId !== tradeId);
        entry.sticker.rececoesPendentes.push({
          tradeId,
          person,
          agreedDate,
          asDuplicate: entry.asDuplicate,
          count: entry.count
        });
        syncIncomingReservationLegacy(entry.sticker);
      });

      const affected = [...giveEntries, ...receiveEntries].map(entry => entry.sticker);
      saveState([...new Set([...previouslyAffectedIds, ...affected.map(sticker => sticker.id)])]);
      try {
        await persistStateNow();
      } catch (error) {
        console.error(error);
      }
      const giveTotal = giveEntries.reduce((sum, entry) => sum + entry.count, 0);
      const receiveTotal = receiveEntries.reduce((sum, entry) => sum + entry.count, 0);
      recordHistory(`${editingReservedTradeId ? "Troca reservada editada" : "Troca reservada criada"} com ${person}: ${giveTotal} a dar e ${receiveTotal} a receber`, { type: "trade", action: editingReservedTradeId ? "reserved_trade_edited" : "reserved_trade_created", partner: person, tradeId, given: expandReservedHistoryEntries(giveEntries), received: expandReservedHistoryEntries(receiveEntries) });
      setSaveStatus(`Troca com ${person} guardada`);
      duplicateViewMode = "reserved";
      closeReserveModal();
      render();
    }

    function finishReservedTrade(tradeId, status) {
      if (isFriendView()) return setSaveStatus(`A caderneta de ${friendProfile} e so de leitura`);
      if (!requireLiveLogin()) return;
      const trade = groupedReservedTrades(stickers).find(item => item.id === tradeId);
      if (!trade) return;
      const person = trade.person;
      const affected = [];
      const givenEntries = [];
      const receivedEntries = [];
      stickers.forEach(sticker => {
        const reservations = normalizeReservations(sticker.reservas);
        const kept = [];
        reservations.forEach(item => {
          const itemTradeId = item.tradeId || legacyReservedTradeId(item.person, item.createdAt);
          if (itemTradeId !== tradeId) return kept.push(item);
          affected.push(sticker);
          givenEntries.push({ sticker, count: item.count });
          if (status === "completed") sticker.repetidos = Math.max(0, normalizeDuplicates(sticker.repetidos) - item.count);
        });
        sticker.reservas = kept;
        sticker.reservados = reservationTotal(sticker);
        syncStickerReservations(sticker);

        const receipt = incomingReservations(sticker).find(item => item.tradeId === tradeId);
        if (receipt) {
          affected.push(sticker);
          receivedEntries.push({ sticker, count: receipt.count });
          if (status === "completed") {
            applyCompletedIncomingReceipt(sticker, receipt);
          }
          sticker.rececoesPendentes = incomingReservations(sticker).filter(item => item.tradeId !== tradeId);
          syncIncomingReservationLegacy(sticker);
        }
      });
      if (!affected.length) return;
      saveState([...new Set(affected.map(sticker => sticker.id))]);
      const done = status === "completed";
      recordHistory(`${done ? "Troca reservada concluida" : "Troca reservada cancelada"} com ${person}`, { type: "trade", action: done ? "reserved_trade_completed" : "reserved_trade_cancelled", partner: person, tradeId, given: expandReservedHistoryEntries(givenEntries), received: expandReservedHistoryEntries(receivedEntries) });
      setSaveStatus(done ? `Troca com ${person} concluida` : `Troca com ${person} cancelada`);
      render();
    }

    function renderDuplicateStickerResults(list) {
      const album = currentAlbumStickers();
      const countries = allCountriesForAlbum(album);
      const availableCountries = countries.filter(country => album.some(sticker => sticker.pais === country && sticker.tenho && availableDuplicates(sticker) > 0));
      const reservedCount = album.reduce((sum, sticker) => sum + reservedDuplicates(sticker), 0);
      const reservedTradeCount = groupedReservedTrades(album).length;
      const availableCount = album.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      const content = duplicateViewMode === "reserved"
        ? `<section class="duplicate-section duplicate-reserved-section"><div class="duplicate-section-title"><span>Trocas reservadas</span><small>${reservedTradeCount}</small></div>${renderReservedGroups(album)}</section>`
        : renderDuplicateCountrySection("Cromos Repetidos", "Nao tens repetidos livres.", availableCountries, album, "available");
      return `
        <section class="search-results duplicate-results" aria-label="Cromos repetidos">
          ${renderDuplicateFilterToolbar(availableCount, reservedTradeCount)}
          ${content}
        </section>
      `;
    }

    function renderFriendDuplicateResults() {
      const album = currentAlbumStickers();
      const countries = allCountriesForAlbum(album);
      const availableCountries = countries.filter(country =>
        album.some(sticker => sticker.pais === country && sticker.tenho && availableDuplicates(sticker) > 0)
      );
      const availableCount = album.reduce((sum, sticker) => sum + availableDuplicates(sticker), 0);
      return `
        <section class="search-results duplicate-results friend-duplicate-results" aria-label="Repetidos de ${escapeHTML(friendProfile)}">
          <div class="friend-duplicate-summary">
            <div>
              <span>Repetidos de ${escapeHTML(friendProfile)}</span>
              <strong>${availableCount}</strong>
            </div>
            <small>${availableCountries.length} selecoes com repetidos</small>
          </div>
          ${renderDuplicateCountrySection(
            "Cromos Repetidos",
            `${friendProfile} nao tem repetidos disponiveis.`,
            availableCountries,
            album,
            "available"
          )}
        </section>
      `;
    }

    function render() {
      const album = currentAlbumStickers();
      updateStats();
      updateSearchControls();
      updateActiveStat();
      renderCountryTabs();
      updateViewTitle();
      updatePageVisibility();
      renderHomeDashboard();
      renderCountryModal();

      const term = search.value.trim();
      const list = filteredStickers();
      const grouped = groupByCountry(list);
      const showDuplicateCardsOnly = currentView === "duplicates" && selectedCountry === "all" && !term;
      if (showDuplicateCardsOnly) countryTabsWrap?.classList.add("hidden");

      if (album.length) {
        if (showDuplicateCardsOnly) {
          updateResultSummary(list);
          content.innerHTML = isFriendView() ? renderFriendDuplicateResults() : renderDuplicateStickerResults(list);
          return;
        }
        const visibleCountryCards = countryTabs?.querySelectorAll(".country-card").length || 0;
        const countryMatches = term ? albumCountries().filter(country => {
          const countryStickers = album.filter(sticker => sticker.pais === country);
          return countrySearchRank(country, countryStickers, term) < 2;
        }) : [];
        const termIsCountry = countryMatches.some(country => searchTermMatchesCountry(country, term));
        const searchMatches = term && !termIsCountry
          ? searchResultStickers(album, term).filter(stickerMatchesCurrentView)
          : [];
        updateResultSummary(filteredStickers({ country: "all", album }));
        content.innerHTML = term
          ? renderSearchResults(countryMatches, searchMatches, term, album)
          : (visibleCountryCards ? "" : renderEmptyState("N\u00e3o h\u00e1 sele\u00e7\u00f5es para mostrar nesta pesquisa."));
        return;
      }

      if (!album.length) {
        resultSummary.textContent = "";
        content.innerHTML = renderEmptyState(isFriendView() ? `${friendProfile} ainda nao tem caderneta online.` : "Ainda n?o tens caderneta carregada.");
        return;
      }

      if (!list.length) {
        updateResultSummary(list);
        content.innerHTML = renderEmptyState(emptyViewMessage());
        return;
      }

      const albumOrder = new Map(albumCountries().map((country, index) => [country, index]));
      const orderedCountries = albumCountries().filter(country => grouped[country]);
      if (term) {
        orderedCountries.sort((a, b) => {
          const rank = countrySearchRank(a, grouped[a], term) - countrySearchRank(b, grouped[b], term);
          if (rank) return rank;
          return (albumOrder.get(a) ?? 0) - (albumOrder.get(b) ?? 0);
        });
      }

      updateResultSummary(list);

      content.innerHTML = orderedCountries.map(country => {
        const countryStickers = grouped[country].sort((a, b) => {
          const rank = term ? stickerSearchRank(a, term) - stickerSearchRank(b, term) : 0;
          if (rank) return rank;
          return a.codigo.localeCompare(b.codigo, "pt-PT", { numeric: true });
        });
        const ownedInCountry = album.filter(s => s.pais === country && s.tenho).length;
        const totalInCountry = album.filter(s => s.pais === country).length;
        const ownedPercent = totalInCountry ? Math.round((ownedInCountry / totalInCountry) * 100) : 0;
        const countryHeaderStats = { owned: ownedInCountry, total: totalInCountry, percent: ownedPercent };

        return `
          <article class="country" style="${sectionStyle(country)}">
            <div class="country-header" onclick="openCountryFromHeader('${escapeJS(country)}')">
              <div class="country-heading">
                <div class="country-title">${escapeHTML(countryFullName(country) || country)}</div>
                ${countryFullName(country) ? `<div class="country-name">${escapeHTML(country)}</div>` : ""}
              </div>
              <div class="country-count ${ownedPercent >= 100 && totalInCountry ? "is-complete" : ""}">${countryProgressLabel(countryHeaderStats, { compact: false, suffix: " obtidos" })}</div>
              <div class="country-progress" aria-hidden="true">
                <div class="country-progress-bar" style="--progress-width:${ownedPercent}%"></div>
              </div>
            </div>

            <div class="stickers">
              ${(() => {
                const teamStickers = countryStickers.filter(isTeamAlbumSticker);
                const regularStickers = countryStickers.filter(sticker => !isTeamAlbumSticker(sticker));
                const firstHalfStickers = regularStickers.filter(sticker => stickerNumber(sticker) <= 10);
                const secondHalfStickers = regularStickers.filter(sticker => stickerNumber(sticker) >= 11);
                return [
                  teamStickers.length ? `<div class="sticker-section sticker-section-featured"><div class="sticker-grid">${teamStickers.map(sticker => renderStickerCard(sticker)).join("")}</div></div>` : "",
                  firstHalfStickers.length ? `<div class="sticker-section"><div class="sticker-grid">${firstHalfStickers.map(sticker => renderStickerCard(sticker)).join("")}</div></div>` : "",
                  secondHalfStickers.length ? `<div class="sticker-section"><div class="sticker-grid">${secondHalfStickers.map(sticker => renderStickerCard(sticker)).join("")}</div></div>` : ""
                ].join("");
              })()}
            </div>
          </article>
        `;
      }).join("");
    }


    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char]));
    }

    function escapeJS(value) {
      return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");
    }

    function loadStickers(list, options = {}) {
      const { useSavedState = false, persist = false } = options;
      const cleaned = list.map(cleanSticker);
      stickers = useSavedState ? mergeWithSavedState(cleaned) : cleaned;
      if (!albumCountries().includes(selectedCountry)) selectedCountry = "all";
      if (persist) saveState();
      render();
    }

    search?.addEventListener("input", scheduleRender);
    authLoginUsernameInput?.addEventListener("input", () => { if (liveUsernameInput) liveUsernameInput.value = authLoginUsernameInput.value; });
    authLoginPasswordInput?.addEventListener("input", () => { if (livePasswordInput) livePasswordInput.value = authLoginPasswordInput.value; });
    authRegisterUsernameInput?.addEventListener("input", () => { if (liveUsernameInput) liveUsernameInput.value = authRegisterUsernameInput.value; });
    authPasswordUsernameInput?.addEventListener("input", () => { if (liveUsernameInput) liveUsernameInput.value = authPasswordUsernameInput.value; });
    authLoginPasswordInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") loginLiveAccount();
    });
    authRegisterPasswordInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") registerLiveAccount();
    });
    authConfirmPasswordInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") changePasswordFromLogin();
    });
    settingsConfirmPasswordInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") changePasswordFromSettings();
    });
    themeColorInput?.addEventListener("input", event => {
      themeColorTextInput.value = event.target.value;
      previewThemeColor();
    });
    themeColorTextInput?.addEventListener("input", previewThemeColor);
    countrySortSelect?.addEventListener("change", event => {
      setCountrySortMode(event.target.value);
    });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && mobileToolsModalOpen) closeMobileToolsModal();
      if (event.key === "Escape" && reserveModalOpen) closeReserveModal();
      if (event.key === "Escape" && countryModalOpen) closeCountryModal();
      if (event.key === "Escape" && tradeModalOpen) closeTradeModal();
      if (event.key === "ArrowLeft" && countryModalOpen) moveCountryModal(-1);
      if (event.key === "ArrowRight" && countryModalOpen) moveCountryModal(1);
    });

    countryScrollLeft?.addEventListener("click", () => scrollCountryTabs(-1));
    countryScrollRight?.addEventListener("click", () => scrollCountryTabs(1));
    countryScrollLeft?.addEventListener("mouseenter", () => startCountryScroll(-1));
    countryScrollRight?.addEventListener("mouseenter", () => startCountryScroll(1));
    countryScrollLeft?.addEventListener("mouseleave", stopCountryScroll);
    countryScrollRight?.addEventListener("mouseleave", stopCountryScroll);
    countryScrollLeft?.addEventListener("mouseover", () => startCountryScroll(-1));
    countryScrollRight?.addEventListener("mouseover", () => startCountryScroll(1));
    countryScrollLeft?.addEventListener("mouseout", stopCountryScroll);
    countryScrollRight?.addEventListener("mouseout", stopCountryScroll);
    countryScrollLeft?.addEventListener("focus", () => startCountryScroll(-1));
    countryScrollRight?.addEventListener("focus", () => startCountryScroll(1));
    countryScrollLeft?.addEventListener("blur", stopCountryScroll);
    countryScrollRight?.addEventListener("blur", stopCountryScroll);
    countryModal?.addEventListener("touchstart", event => startModalTouchGesture(event, "country"), { passive: true });
    countryModal?.addEventListener("touchmove", moveModalTouchGesture, { passive: false });
    countryModal?.addEventListener("touchend", endModalTouchGesture, { passive: true });
    countryModal?.addEventListener("touchcancel", cancelModalTouchGesture, { passive: true });
    tradeModal?.addEventListener("touchstart", event => startModalTouchGesture(event, "trade"), { passive: true });
    tradeModal?.addEventListener("touchmove", moveModalTouchGesture, { passive: false });
    tradeModal?.addEventListener("touchend", endModalTouchGesture, { passive: true });
    tradeModal?.addEventListener("touchcancel", cancelModalTouchGesture, { passive: true });
    window.addEventListener("resize", applyCountryTabsOffset);
    registerIdleActivityListeners();
    loadCountrySortMode();
    loadAppTheme();


    async function loadBaseAlbum() {
      const response = await apiFetch("/api/base-cromos", { cache: "no-store" });
      if (!response.ok) throw new Error("Sem caderneta base");
      const text = await response.text();
      loadStickers(parseTextFile(text));
      setSaveStatus("Caderneta online pronta");
    }


    initLiveMode().catch(() => {});

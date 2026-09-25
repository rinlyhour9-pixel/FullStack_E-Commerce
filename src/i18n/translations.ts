export type Language = "en" | "km";

export interface ChoiceCopy {
  label: string;
  note: string;
}

export interface StoreInfoItem {
  title: string;
  detail: string;
}

export interface Translations {
  common: {
    search: string;
    wishlist: string;
    cart: string;
    account: string;
    addToBag: string;
    quickAddToBag: string;
    outOfStock: string;
    soldOut: string;
    new: string;
    bestseller: string;
    limited: string;
    verifiedPurchase: string;
    freeShippingOver50: string;
    veganCrueltyFree: string;
    returns30Day: string;
    demoStoreNotice: string;
    close: string;
    continueShopping: string;
    addedToBagSuffix: string;
    savedToWishlistSuffix: string;
    removedFromWishlistSuffix: string;
    skipToContent: string;
  };
  categories: {
    cleansers: string;
    serums: string;
    moisturizers: string;
    masks: string;
    "sun-care": string;
    body: string;
  };
  skinTypes: {
    all: string;
    dry: string;
    oily: string;
    combination: string;
    sensitive: string;
  };
  nav: {
    shopAll: string;
    cleansers: string;
    serums: string;
    moisturizers: string;
    sunCare: string;
    routineFinder: string;
    account: string;
    wishlist: string;
    openMenu: string;
    closeMenu: string;
  };
  announcement: string[];
  search: {
    placeholder: string;
    noResultsPrefix: string;
    tryPrefix: string;
    popularSearches: string;
    popularTerms: string[];
  };
  home: {
    heroEyebrow: string;
    heroTitleStart: string;
    heroTitleItalic: string;
    heroTitleEnd: string;
    heroDescription: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    heroRoutinePrompt: string;
    heroRoutineLink: string;
    categoriesEyebrow: string;
    categoriesTitle: string;
    bestsellersEyebrow: string;
    bestsellersTitle: string;
    shopAllProducts: string;
    promoRitualEyebrow: string;
    promoRitualTitle: string;
    promoRitualBody: string;
    promoRitualCta: string;
    promoCleanEyebrow: string;
    promoCleanTitle: string;
    promoCleanBody: string;
    promoCleanCta: string;
    testimonialsEyebrow: string;
    testimonialsTitle: string;
    newsletterTitle: string;
    newsletterBody: string;
    newsletterPlaceholder: string;
    newsletterButton: string;
  };
  storeInfo: {
    eyebrow: string;
    title: string;
    intro: string;
    items: StoreInfoItem[];
    footerNote: string;
    cta: string;
  };
  shop: {
    title: string;
    resultsSuffix: string;
    searchingLabel: string;
    searchPlaceholder: string;
    searchForLabel: string;
    filtersButton: string;
    filtersTitle: string;
    clearAll: string;
    categoryLabel: string;
    priceLabel: string;
    skinTypeLabel: string;
    sortLabel: string;
    sortFeatured: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortRating: string;
    noResultsTitle: string;
    noResultsDesc: string;
    clearFilters: string;
    showResults: string;
    priceUnder30: string;
    price30to50: string;
    price50to70: string;
    priceOver70: string;
  };
  product: {
    breadcrumbShop: string;
    size: string;
    quantity: string;
    description: string;
    howToUse: string;
    ingredients: string;
    reviews: string;
    relatedTitle: string;
    notFoundTitle: string;
    notFoundDesc: string;
    backToShop: string;
    basedOnReviewsPrefix: string;
    noReviewsYet: string;
    previousImage: string;
    nextImage: string;
  };
  cart: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    unlockedFreeShipping: string;
    addMoreForFreeShipping: string;
    subtotal: string;
    shipping: string;
    free: string;
    calculatedAtCheckout: string;
    estimatedTax: string;
    total: string;
    proceedToCheckout: string;
    secureDemoNote: string;
    remove: string;
    orderSummary: string;
    each: string;
    removedFromBagSuffix: string;
    freeShippingOverPrefix: string;
    drawerEmptyDesc: string;
    shippingTaxNote: string;
    checkout: string;
    viewBag: string;
  };
  checkout: {
    title: string;
    contact: string;
    emailAddress: string;
    deliveryDetails: string;
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    payment: string;
    demoOnly: string;
    demoPaymentNote: string;
    nameOnCard: string;
    cardNumber: string;
    expiry: string;
    securityCode: string;
    orderReview: string;
    placeOrder: string;
    noRealPayment: string;
    demoOrderBadge: string;
    thankYou: string;
    confirmationNote: string;
    orderSummary: string;
    emptyTitle: string;
    emptyDesc: string;
    browseProducts: string;
    errors: {
      email: string;
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      cardName: string;
      cardNumber: string;
      cardExpiry: string;
      cardCvc: string;
    };
  };
  account: {
    notSignedInTitle: string;
    notSignedInDesc: string;
    signIn: string;
    createAccount: string;
    sellerPrompt: string;
    sellerLink: string;
    helloPrefix: string;
    signOut: string;
    demoNotice: string;
    sellerBannerText: string;
    sellerDashboardButton: string;
    orderHistory: string;
    noOrdersTitle: string;
    noOrdersDesc: string;
    startShopping: string;
    profile: string;
    name: string;
    email: string;
    viewWishlist: string;
    signedOut: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    signInButton: string;
    newToStore: string;
    createAccountLink: string;
    registerTitle: string;
    registerSubtitle: string;
    fullNameLabel: string;
    passwordHint: string;
    createAccountButton: string;
    alreadyHaveAccount: string;
    signInLink: string;
    welcomeBack: string;
    invalidCredentials: string;
    nameRequired: string;
    invalidEmail: string;
    passwordTooShort: string;
    accountCreated: string;
  };
  wishlist: {
    title: string;
    countSuffix: string;
    emptyTitle: string;
    emptyDesc: string;
    discoverProducts: string;
    addToBag: string;
  };
  notFound: {
    heading: string;
    description: string;
    backHome: string;
  };
  routineFinder: {
    breadcrumb: string;
    eyebrow: string;
    titleStart: string;
    titleItalic: string;
    description: string;
    quickCheckLabel: string;
    oneMinute: string;
    stepsLabel: string;
    sectionEyebrow: string;
    sectionTitle: string;
    skinTypeQuestion: string;
    concernQuestion: string;
    buildButton: string;
    noSignup: string;
    disclaimer: string;
    skinTypes: ChoiceCopy[];
    concerns: ChoiceCopy[];
    concernNote: string;
    resultsEyebrow: string;
    resultsTitle: string;
    resultsDescPrefix: string;
    resultsDescMiddle: string;
    editAnswers: string;
    steps: string[];
    noMatch: string;
    ctaTitle: string;
    ctaDesc: string;
    browseAll: string;
  };
  footer: {
    description: string;
    veganCrueltyFree: string;
    shopColumn: string;
    helpColumn: string;
    companyColumn: string;
    cleansers: string;
    serums: string;
    moisturizers: string;
    sunCare: string;
    routineFinder: string;
    storeInformation: string;
    findYourRoutine: string;
    shopAll: string;
    ourStory: string;
    ingredients: string;
    sustainability: string;
    wishlist: string;
    sellerLogin: string;
    joinList: string;
    joinDesc: string;
    emailPlaceholder: string;
    join: string;
    copyright: string;
    demoNotice: string;
  };
}

export const en: Translations = {
  common: {
    search: "Search",
    wishlist: "Wishlist",
    cart: "Cart",
    account: "Account",
    addToBag: "Add to bag",
    quickAddToBag: "Quick add to bag",
    outOfStock: "Out of stock",
    soldOut: "Sold out",
    new: "New",
    bestseller: "Bestseller",
    limited: "Limited",
    verifiedPurchase: "Verified purchase",
    freeShippingOver50: "Free shipping over $50",
    veganCrueltyFree: "Vegan & cruelty-free",
    returns30Day: "30-day returns",
    demoStoreNotice: "This is a demo storefront. No real orders or payments are processed.",
    close: "Close",
    continueShopping: "Continue shopping",
    addedToBagSuffix: "added to your bag.",
    savedToWishlistSuffix: "saved to your wishlist.",
    removedFromWishlistSuffix: "removed from your wishlist.",
    skipToContent: "Skip to content",
  },
  categories: {
    cleansers: "Cleansers",
    serums: "Serums",
    moisturizers: "Moisturizers",
    masks: "Masks",
    "sun-care": "Sun Care",
    body: "Body",
  },
  skinTypes: {
    all: "All",
    dry: "Dry",
    oily: "Oily",
    combination: "Combination",
    sensitive: "Sensitive",
  },
  nav: {
    shopAll: "Shop All",
    cleansers: "Cleansers",
    serums: "Serums",
    moisturizers: "Moisturizers",
    sunCare: "Sun Care",
    routineFinder: "Routine Finder",
    account: "Account",
    wishlist: "Wishlist",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  announcement: [
    "Free shipping on orders over $50",
    "New: Bakuchiol Renewal Serum has landed",
    "30-day satisfaction guarantee on every order",
    "Demo store — no real payments are processed",
  ],
  search: {
    placeholder: "Search cleansers, serums, moisturizers…",
    noResultsPrefix: "No products found for",
    tryPrefix: "Try",
    popularSearches: "Popular searches",
    popularTerms: ["Serum", "Cleanser", "SPF", "Moisturizer"],
  },
  home: {
    heroEyebrow: "Clean, considered skincare",
    heroTitleStart: "Skin care that ",
    heroTitleItalic: "listens",
    heroTitleEnd: " before it acts.",
    heroDescription:
      "Small-batch formulas built on clinically-backed botanicals — no fillers, no guesswork, no fifteen-step routines. Just what your skin actually needs.",
    heroCtaPrimary: "Shop Bestsellers",
    heroCtaSecondary: "Explore Serums",
    heroRoutinePrompt: "Not sure where to start?",
    heroRoutineLink: "Take our 1-minute routine finder",
    categoriesEyebrow: "Shop by need",
    categoriesTitle: "Find your routine",
    bestsellersEyebrow: "Fan favorites",
    bestsellersTitle: "Bestsellers",
    shopAllProducts: "Shop all products",
    promoRitualEyebrow: "The ritual",
    promoRitualTitle: "Five minutes, twice a day.",
    promoRitualBody:
      "Our routines are built around a simple idea: skin thrives on consistency, not complexity. Cleanse, treat, protect — that's it.",
    promoRitualCta: "Shop routines",
    promoCleanEyebrow: "Clean by design",
    promoCleanTitle: "Every ingredient, justified.",
    promoCleanBody:
      "No fillers, no unnecessary fragrance, no guesswork. We publish full ingredient lists and the research behind every formula.",
    promoCleanCta: "Read our approach",
    testimonialsEyebrow: "Loved by our community",
    testimonialsTitle: "What customers are saying",
    newsletterTitle: "Get 10% off your first order",
    newsletterBody: "Join our list for early access to new formulas, routine tips, and subscriber-only offers.",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "Subscribe",
  },
  storeInfo: {
    eyebrow: "Store information",
    title: "Thoughtful care, with a warm welcome.",
    intro: "Simple skincare, helpful guidance, and clear information at every step.",
    items: [
      { title: "Free shipping", detail: "On orders over $50" },
      { title: "30-day guarantee", detail: "Shop with confidence, backed by a 30-day satisfaction guarantee" },
      { title: "Thoughtful formulas", detail: "No animal testing, and vegan-friendly across the board" },
    ],
    footerNote: "Note: this is a demo storefront and does not process real payments.",
    cta: "Find your routine",
  },
  shop: {
    title: "Shop All",
    resultsSuffix: "products",
    searchingLabel: "Searching…",
    searchPlaceholder: "Search this shop…",
    searchForLabel: "for",
    filtersButton: "Filters",
    filtersTitle: "Filters",
    clearAll: "Clear all",
    categoryLabel: "Category",
    priceLabel: "Price",
    skinTypeLabel: "Skin type",
    sortLabel: "Sort",
    sortFeatured: "Featured",
    sortNewest: "Newest",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortRating: "Top Rated",
    noResultsTitle: "No products found",
    noResultsDesc: "Try adjusting your filters or search terms to find what you're looking for.",
    clearFilters: "Clear filters",
    showResults: "Show",
    priceUnder30: "Under $30",
    price30to50: "$30 – $50",
    price50to70: "$50 – $70",
    priceOver70: "Over $70",
  },
  product: {
    breadcrumbShop: "Shop",
    size: "Size",
    quantity: "Quantity",
    description: "Description",
    howToUse: "How to use",
    ingredients: "Ingredients",
    reviews: "Reviews",
    relatedTitle: "You may also like",
    notFoundTitle: "Product not found",
    notFoundDesc: "This product may have been removed or the link is incorrect.",
    backToShop: "Back to shop",
    basedOnReviewsPrefix: "Based on",
    noReviewsYet: "No reviews yet — be the first to share your experience.",
    previousImage: "Previous image",
    nextImage: "Next image",
  },
  cart: {
    title: "Your Bag",
    emptyTitle: "Your bag is empty",
    emptyDesc: "Looks like you haven't added anything yet. Explore our bestsellers to get started.",
    unlockedFreeShipping: "You've unlocked free shipping!",
    addMoreForFreeShipping: "Add {amount} more for free shipping.",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    calculatedAtCheckout: "Calculated at checkout",
    estimatedTax: "Estimated tax",
    total: "Total",
    proceedToCheckout: "Proceed to checkout",
    secureDemoNote: "Secure demo checkout — no real payment",
    remove: "Remove",
    orderSummary: "Order Summary",
    each: "each",
    removedFromBagSuffix: "removed from your bag.",
    freeShippingOverPrefix: "Free shipping on orders over",
    drawerEmptyDesc: "Explore the shop and find your next skincare staple.",
    shippingTaxNote: "Shipping and taxes calculated at checkout.",
    checkout: "Checkout",
    viewBag: "View bag",
  },
  checkout: {
    title: "Checkout",
    contact: "Contact",
    emailAddress: "Email address",
    deliveryDetails: "Delivery details",
    firstName: "First name",
    lastName: "Last name",
    streetAddress: "Street address",
    city: "City",
    postalCode: "Postal code",
    country: "Country",
    payment: "Payment",
    demoOnly: "Demo only",
    demoPaymentNote: "This is a demo store. Card details are validated for format only and are never sent anywhere.",
    nameOnCard: "Name on card",
    cardNumber: "Card number",
    expiry: "Expiry (MM/YY)",
    securityCode: "Security code",
    orderReview: "Order review",
    placeOrder: "Place demo order",
    noRealPayment: "No real payment will be charged",
    demoOrderBadge: "Demo order — no real payment was processed",
    thankYou: "Thank you,",
    confirmationNote: "has been placed. A confirmation would normally be sent to",
    orderSummary: "Order summary",
    emptyTitle: "Nothing to check out",
    emptyDesc: "Add a few products to your bag before heading to checkout.",
    browseProducts: "Browse products",
    errors: {
      email: "Enter a valid email address.",
      firstName: "First name is required.",
      lastName: "Last name is required.",
      address: "Street address is required.",
      city: "City is required.",
      postalCode: "Enter a valid postal code.",
      country: "Country is required.",
      cardName: "Name on card is required.",
      cardNumber: "Enter a valid card number.",
      cardExpiry: "Use MM/YY format.",
      cardCvc: "Enter a valid security code.",
    },
  },
  account: {
    notSignedInTitle: "You're not signed in",
    notSignedInDesc: "Sign in to view your demo account, or create a new one in seconds.",
    signIn: "Sign in",
    createAccount: "Create account",
    sellerPrompt: "Are you a seller?",
    sellerLink: "Go to the seller dashboard",
    helloPrefix: "Hello,",
    signOut: "Sign out",
    demoNotice: "This is a demo account stored only in your browser. No real customer data is collected.",
    sellerBannerText: "You're signed in with seller access.",
    sellerDashboardButton: "Seller dashboard",
    orderHistory: "Order history",
    noOrdersTitle: "No orders yet",
    noOrdersDesc: "Your demo orders will appear here after checkout.",
    startShopping: "Start shopping",
    profile: "Profile",
    name: "Name",
    email: "Email",
    viewWishlist: "View your wishlist",
    signedOut: "You've been signed out.",
  },
  auth: {
    signInTitle: "Sign in to TAMJIT",
    signInSubtitle: "Demo account — enter any email and a password of 6+ characters.",
    emailLabel: "Email address",
    passwordLabel: "Password",
    signInButton: "Sign in",
    newToStore: "New to TAMJIT?",
    createAccountLink: "Create an account",
    registerTitle: "Create your account",
    registerSubtitle: "Demo registration — no data leaves your browser.",
    fullNameLabel: "Full name",
    passwordHint: "Minimum 6 characters.",
    createAccountButton: "Create account",
    alreadyHaveAccount: "Already have an account?",
    signInLink: "Sign in",
    welcomeBack: "Welcome back!",
    invalidCredentials: "Enter a valid email and a password of at least 6 characters.",
    nameRequired: "Please enter your name.",
    invalidEmail: "Enter a valid email address.",
    passwordTooShort: "Password must be at least 6 characters.",
    accountCreated: "Account created — welcome to TAMJIT.",
  },
  wishlist: {
    title: "Your Wishlist",
    countSuffix: "saved product",
    emptyTitle: "Your wishlist is empty",
    emptyDesc: "Save products you love and they'll show up here.",
    discoverProducts: "Discover products",
    addToBag: "Add to bag",
  },
  notFound: {
    heading: "Page not found",
    description: "The page you're looking for doesn't exist or may have moved.",
    backHome: "Back to home",
  },
  routineFinder: {
    breadcrumb: "Routine finder",
    eyebrow: "Your skin, your routine",
    titleStart: "A simpler place to ",
    titleItalic: "begin.",
    description:
      "Tell us what your skin is like and what you want help with. We'll put together three thoughtful starting points from our collection.",
    quickCheckLabel: "Quick skin check",
    oneMinute: "1 minute",
    stepsLabel: "Skin type / Main goal / Your picks",
    sectionEyebrow: "Let's get to know your skin",
    sectionTitle: "What sounds most like you?",
    skinTypeQuestion: "How would you describe your skin?",
    concernQuestion: "What would you like to focus on?",
    buildButton: "Build my routine",
    noSignup: "No sign-up needed",
    disclaimer:
      "A helpful starting point, not medical advice. If you have ongoing skin concerns, a dermatologist can give you advice tailored to you.",
    skinTypes: [
      { label: "Dry", note: "Often feels tight or flaky" },
      { label: "Oily", note: "Gets shiny through the day" },
      { label: "Combination", note: "Oily in some areas, dry in others" },
      { label: "Sensitive", note: "Can feel reactive or easily irritated" },
      { label: "Not sure yet", note: "Show me gentle, balanced picks" },
    ],
    concerns: [
      { label: "More hydration", note: "" },
      { label: "Calm and comfort", note: "" },
      { label: "Brighter, more even skin", note: "" },
      { label: "Balance and clear pores", note: "" },
      { label: "Fewer fine lines", note: "" },
      { label: "Daily sun protection", note: "" },
    ],
    concernNote: "We'll prioritize products that support this goal",
    resultsEyebrow: "Made for your answers",
    resultsTitle: "Your simple daily routine",
    resultsDescPrefix: "A considered starting point for",
    resultsDescMiddle: "skin, with a focus on",
    editAnswers: "Edit my answers",
    steps: ["01 · Cleanse", "02 · Treat", "03 · Moisturize", "04 · Protect"],
    noMatch: "We couldn't find a complete match. Try “Not sure yet” for a broader selection.",
    ctaTitle: "Good skin days, one step at a time.",
    ctaDesc: "Explore the full collection whenever you're ready.",
    browseAll: "Browse everything",
  },
  footer: {
    description:
      "Considered skincare, formulated with clean, effective botanicals. Small batches, honest ingredient lists, no exceptions.",
    veganCrueltyFree: "Vegan & cruelty-free",
    shopColumn: "Shop",
    helpColumn: "Help",
    companyColumn: "Company",
    cleansers: "Cleansers",
    serums: "Serums",
    moisturizers: "Moisturizers",
    sunCare: "Sun Care",
    routineFinder: "Routine Finder",
    storeInformation: "Store information",
    findYourRoutine: "Find your routine",
    shopAll: "Shop all",
    ourStory: "Our Story",
    ingredients: "Ingredients",
    sustainability: "Sustainability",
    wishlist: "Wishlist",
    sellerLogin: "Seller Login",
    joinList: "Join the list",
    joinDesc: "Early access to new formulas and 10% off your first order.",
    emailPlaceholder: "you@example.com",
    join: "Join",
    copyright: "TAMJIT Shop. All rights reserved.",
    demoNotice: "This is a demo storefront. No real orders or payments are processed.",
  },
};

export const km: Translations = {
  common: {
    search: "ស្វែងរក",
    wishlist: "បញ្ជីចង់បាន",
    cart: "កន្ត្រក",
    account: "គណនី",
    addToBag: "ដាក់ចូលកន្ត្រក",
    quickAddToBag: "ដាក់ចូលកន្ត្រកភ្លាមៗ",
    outOfStock: "អស់ស្តុក",
    soldOut: "លក់អស់ហើយ",
    new: "ថ្មី",
    bestseller: "លក់ដាច់បំផុត",
    limited: "មានកំណត់",
    verifiedPurchase: "ការទិញដែលបានផ្ទៀងផ្ទាត់",
    freeShippingOver50: "ដឹកជញ្ជូនឥតគិតថ្លៃ លើការកុម្ម៉ង់លើស $50",
    veganCrueltyFree: "ផលិតផលបួស និងគ្មានការសាកល្បងលើសត្វ",
    returns30Day: "ដូរឬបង្វិលប្រាក់ក្នុងរយៈពេល ៣០ ថ្ងៃ",
    demoStoreNotice: "នេះជាហាងគំរូ។ មិនមានការកុម្ម៉ង់ ឬទូទាត់ប្រាក់ពិតប្រាកដទេ។",
    close: "បិទ",
    continueShopping: "បន្តទិញទំនិញ",
    addedToBagSuffix: "ត្រូវបានដាក់ចូលកន្ត្រករបស់អ្នក។",
    savedToWishlistSuffix: "ត្រូវបានរក្សាទុកក្នុងបញ្ជីចង់បានរបស់អ្នក។",
    removedFromWishlistSuffix: "ត្រូវបានលុបចេញពីបញ្ជីចង់បានរបស់អ្នក។",
    skipToContent: "រំលងទៅមាតិកា",
  },
  categories: {
    cleansers: "ទឹកលាងមុខ",
    serums: "សេរ៉ូម",
    moisturizers: "ក្រែមផ្តល់សំណើម",
    masks: "ម៉ាស់",
    "sun-care": "ការពារកម្តៅថ្ងៃ",
    body: "ថែរក្សាសម្បុរ",
  },
  skinTypes: {
    all: "ទាំងអស់",
    dry: "ស្បែកស្ងួត",
    oily: "ស្បែកមូន",
    combination: "ស្បែកលាយ",
    sensitive: "ស្បែកប្រែប្រួល",
  },
  nav: {
    shopAll: "ទំនិញទាំងអស់",
    cleansers: "ទឹកលាងមុខ",
    serums: "សេរ៉ូម",
    moisturizers: "ក្រែមផ្តល់សំណើម",
    sunCare: "ការពារកម្តៅថ្ងៃ",
    routineFinder: "ស្វែងរករបបថែទាំ",
    account: "គណនី",
    wishlist: "បញ្ជីចង់បាន",
    openMenu: "បើកម៉ឺនុយ",
    closeMenu: "បិទម៉ឺនុយ",
  },
  announcement: [
    "ដឹកជញ្ជូនឥតគិតថ្លៃ សម្រាប់ការកុម្ម៉ង់លើស $50",
    "ថ្មី៖ សេរ៉ូម Bakuchiol Renewal មកដល់ហើយ",
    "ធានាការពេញចិត្តរយៈពេល ៣០ ថ្ងៃ សម្រាប់រាល់ការកុម្ម៉ង់",
    "ហាងគំរូ — មិនមានការទូទាត់ប្រាក់ពិតប្រាកដទេ",
  ],
  search: {
    placeholder: "ស្វែងរកទឹកលាងមុខ សេរ៉ូម ក្រែមផ្តល់សំណើម…",
    noResultsPrefix: "រកមិនឃើញផលិតផលសម្រាប់",
    tryPrefix: "សាកល្បង",
    popularSearches: "ការស្វែងរកពេញនិយម",
    popularTerms: ["សេរ៉ូម", "ទឹកលាងមុខ", "ការពារកម្តៅថ្ងៃ", "ក្រែមផ្តល់សំណើម"],
  },
  home: {
    heroEyebrow: "ការថែរក្សាស្បែកស្អាតស្អំ និងគិតគូរយ៉ាងម៉ត់ចត់",
    heroTitleStart: "ការថែរក្សាស្បែកដែល",
    heroTitleItalic: "ស្តាប់ស្បែកអ្នក",
    heroTitleEnd: "មុននឹងធ្វើសកម្មភាព។",
    heroDescription:
      "រូបមន្តផលិតជាបាច់តូច សាងសង់លើរុក្ខជាតិដែលមានភស្តុតាងវេជ្ជសាស្ត្រ — គ្មានសារធាតុបំពេញ គ្មានការស្មានទាយ គ្មានជំហានថែទាំដប់ប្រាំ។ គ្រាន់តែជាអ្វីដែលស្បែកអ្នកពិតជាត្រូវការ។",
    heroCtaPrimary: "ទិញផលិតផលលក់ដាច់",
    heroCtaSecondary: "មើលសេរ៉ូម",
    heroRoutinePrompt: "មិនប្រាកដថាត្រូវចាប់ផ្តើមពីណា?",
    heroRoutineLink: "សាកល្បងស្វែងរករបបថែទាំក្នុងរយៈពេល ១ នាទី",
    categoriesEyebrow: "ទិញតាមតម្រូវការ",
    categoriesTitle: "ស្វែងរករបបថែទាំរបស់អ្នក",
    bestsellersEyebrow: "ជាទីពេញចិត្ត",
    bestsellersTitle: "ផលិតផលលក់ដាច់បំផុត",
    shopAllProducts: "មើលទំនិញទាំងអស់",
    promoRitualEyebrow: "របៀបប្រចាំថ្ងៃ",
    promoRitualTitle: "ប្រាំនាទី ពីរដងក្នុងមួយថ្ងៃ",
    promoRitualBody:
      "របបថែទាំរបស់យើងសាងសង់លើគំនិតសាមញ្ញមួយ៖ ស្បែកលូតលាស់ល្អដោយសារភាពទៀងទាត់ មិនមែនភាពស្មុគស្មាញទេ។ លាង ព្យាបាល ការពារ — គ្រាន់តែប៉ុណ្ណឹង។",
    promoRitualCta: "មើលរបបថែទាំ",
    promoCleanEyebrow: "ស្អាតតាមការរចនា",
    promoCleanTitle: "គ្រប់សារធាតុ សុទ្ធតែមានហេតុផល",
    promoCleanBody:
      "គ្មានសារធាតុបំពេញ គ្មានក្លិនក្រអូបលើសលប់ គ្មានការស្មានទាយ។ យើងបង្ហាញបញ្ជីសារធាតុពេញលេញ និងការស្រាវជ្រាវនៅពីក្រោយរូបមន្តនីមួយៗ។",
    promoCleanCta: "អានពីវិធីសាស្ត្ររបស់យើង",
    testimonialsEyebrow: "ត្រូវបានស្រឡាញ់ដោយសហគមន៍របស់យើង",
    testimonialsTitle: "អ្វីដែលអតិថិជនកំពុងនិយាយ",
    newsletterTitle: "ទទួលបានការបញ្ចុះតម្លៃ ១០% សម្រាប់ការកុម្ម៉ង់ដំបូង",
    newsletterBody: "ចុះឈ្មោះទទួលព័ត៌មានមុនគេអំពីរូបមន្តថ្មី គន្លឹះថែទាំ និងការផ្តល់ជូនពិសេសសម្រាប់សមាជិក។",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "ចុះឈ្មោះ",
  },
  storeInfo: {
    eyebrow: "ព័ត៌មានហាង",
    title: "ការថែទាំដ៏គិតគូរ ជាមួយការស្វាគមន៍ដ៏កក់ក្តៅ",
    intro: "ការថែរក្សាស្បែកសាមញ្ញ ការណែនាំមានប្រយោជន៍ និងព័ត៌មានច្បាស់លាស់គ្រប់ជំហាន។",
    items: [
      { title: "ដឹកជញ្ជូនឥតគិតថ្លៃ", detail: "លើការកុម្ម៉ង់ចាប់ពី $50 ឡើងទៅ" },
      { title: "ការធានាការពេញចិត្ត", detail: "ទិញដោយមានទំនុកចិត្ត ជាមួយការធានារយៈពេល ៣០ ថ្ងៃ" },
      { title: "រូបមន្តគិតគូរយ៉ាងល្អិតល្អន់", detail: "គ្មានការសាកល្បងលើសត្វ និងជាផលិតផលបួសទាំងស្រុង" },
    ],
    footerNote: "ចំណាំ៖ នេះជាហាងគំរូ ហើយមិនដំណើរការទូទាត់ប្រាក់ពិតប្រាកដទេ។",
    cta: "ស្វែងរករបបថែទាំរបស់អ្នក",
  },
  shop: {
    title: "ទំនិញទាំងអស់",
    resultsSuffix: "ផលិតផល",
    searchingLabel: "កំពុងស្វែងរក…",
    searchPlaceholder: "ស្វែងរកនៅក្នុងហាងនេះ…",
    searchForLabel: "សម្រាប់",
    filtersButton: "តម្រង",
    filtersTitle: "តម្រង",
    clearAll: "សម្អាតទាំងអស់",
    categoryLabel: "ប្រភេទ",
    priceLabel: "តម្លៃ",
    skinTypeLabel: "ប្រភេទស្បែក",
    sortLabel: "តម្រៀប",
    sortFeatured: "លេចធ្លោ",
    sortNewest: "ថ្មីបំផុត",
    sortPriceAsc: "តម្លៃ៖ ទាបទៅខ្ពស់",
    sortPriceDesc: "តម្លៃ៖ ខ្ពស់ទៅទាប",
    sortRating: "ការវាយតម្លៃខ្ពស់បំផុត",
    noResultsTitle: "រកមិនឃើញផលិតផលទេ",
    noResultsDesc: "សូមសាកល្បងកែសម្រួលតម្រង ឬពាក្យស្វែងរករបស់អ្នក។",
    clearFilters: "សម្អាតតម្រង",
    showResults: "បង្ហាញ",
    priceUnder30: "ក្រោម $30",
    price30to50: "$30 – $50",
    price50to70: "$50 – $70",
    priceOver70: "លើស $70",
  },
  product: {
    breadcrumbShop: "ហាង",
    size: "ទំហំ",
    quantity: "ចំនួន",
    description: "ការពិពណ៌នា",
    howToUse: "របៀបប្រើ",
    ingredients: "សារធាតុផ្សំ",
    reviews: "មតិវាយតម្លៃ",
    relatedTitle: "អ្នកអាចនឹងចូលចិត្ត",
    notFoundTitle: "រកមិនឃើញផលិតផលទេ",
    notFoundDesc: "ផលិតផលនេះប្រហែលជាត្រូវបានលុប ឬតំណភ្ជាប់មិនត្រឹមត្រូវ។",
    backToShop: "ត្រឡប់ទៅហាង",
    basedOnReviewsPrefix: "ផ្អែកលើ",
    noReviewsYet: "មិនទាន់មានមតិវាយតម្លៃទេ — ក្លាយជាអ្នកដំបូងដែលចែករំលែកបទពិសោធន៍របស់អ្នក។",
    previousImage: "រូបភាពមុន",
    nextImage: "រូបភាពបន្ទាប់",
  },
  cart: {
    title: "កន្ត្រករបស់អ្នក",
    emptyTitle: "កន្ត្រករបស់អ្នកទទេ",
    emptyDesc: "មើលទៅដូចជាអ្នកមិនទាន់បន្ថែមអ្វីនៅឡើយទេ។ សូមមើលផលិតផលលក់ដាច់របស់យើង។",
    unlockedFreeShipping: "អ្នកទទួលបានការដឹកជញ្ជូនឥតគិតថ្លៃហើយ!",
    addMoreForFreeShipping: "បន្ថែម {amount} ទៀត ដើម្បីទទួលការដឹកជញ្ជូនឥតគិតថ្លៃ។",
    subtotal: "សរុបរង",
    shipping: "ការដឹកជញ្ជូន",
    free: "ឥតគិតថ្លៃ",
    calculatedAtCheckout: "គណនានៅពេលទូទាត់",
    estimatedTax: "ពន្ធប៉ាន់ស្មាន",
    total: "សរុប",
    proceedToCheckout: "បន្តទៅការទូទាត់",
    secureDemoNote: "ការទូទាត់គំរូដ៏មានសុវត្ថិភាព — មិនមានការទូទាត់ប្រាក់ពិតប្រាកដទេ",
    remove: "លុប",
    orderSummary: "សេចក្តីសង្ខេបការកុម្ម៉ង់",
    each: "ក្នុងមួយឯកតា",
    removedFromBagSuffix: "ត្រូវបានលុបចេញពីកន្ត្រករបស់អ្នក។",
    freeShippingOverPrefix: "ដឹកជញ្ជូនឥតគិតថ្លៃ សម្រាប់ការកុម្ម៉ង់លើស",
    drawerEmptyDesc: "រកមើលហាង ដើម្បីស្វែងរកផលិតផលថែរក្សាស្បែកបន្ទាប់របស់អ្នក។",
    shippingTaxNote: "ការដឹកជញ្ជូន និងពន្ធនឹងគណនានៅពេលទូទាត់។",
    checkout: "ទូទាត់ប្រាក់",
    viewBag: "មើលកន្ត្រក",
  },
  checkout: {
    title: "ការទូទាត់",
    contact: "ទំនាក់ទំនង",
    emailAddress: "អាសយដ្ឋានអ៊ីមែល",
    deliveryDetails: "ព័ត៌មានលម្អិតការដឹកជញ្ជូន",
    firstName: "នាមខ្លួន",
    lastName: "នាមត្រកូល",
    streetAddress: "អាសយដ្ឋានផ្លូវ",
    city: "ទីក្រុង",
    postalCode: "លេខកូដប្រៃសណីយ៍",
    country: "ប្រទេស",
    payment: "ការទូទាត់ប្រាក់",
    demoOnly: "សម្រាប់គំរូតែប៉ុណ្ណោះ",
    demoPaymentNote: "នេះជាហាងគំរូ។ ព័ត៌មានកាតត្រូវបានផ្ទៀងផ្ទាត់តាមទម្រង់តែប៉ុណ្ណោះ ហើយមិនត្រូវបានផ្ញើទៅកន្លែងណាឡើយ។",
    nameOnCard: "ឈ្មោះនៅលើកាត",
    cardNumber: "លេខកាត",
    expiry: "ថ្ងៃផុតកំណត់ (ខែ/ឆ្នាំ)",
    securityCode: "លេខសម្ងាត់សុវត្ថិភាព",
    orderReview: "ពិនិត្យមើលការកុម្ម៉ង់",
    placeOrder: "កុម្ម៉ង់គំរូ",
    noRealPayment: "គ្មានការទូទាត់ប្រាក់ពិតប្រាកដទេ",
    demoOrderBadge: "ការកុម្ម៉ង់គំរូ — មិនមានការទូទាត់ប្រាក់ពិតប្រាកដទេ",
    thankYou: "សូមអរគុណ,",
    confirmationNote: "ត្រូវបានដាក់ស្នើហើយ។ ការបញ្ជាក់ជាធម្មតានឹងត្រូវផ្ញើទៅកាន់",
    orderSummary: "សេចក្តីសង្ខេបការកុម្ម៉ង់",
    emptyTitle: "គ្មានអ្វីត្រូវទូទាត់ទេ",
    emptyDesc: "សូមបន្ថែមផលិតផលមួយចំនួនទៅកន្ត្រករបស់អ្នក មុននឹងទៅកាន់ការទូទាត់។",
    browseProducts: "រកមើលផលិតផល",
    errors: {
      email: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ។",
      firstName: "ត្រូវការនាមខ្លួន។",
      lastName: "ត្រូវការនាមត្រកូល។",
      address: "ត្រូវការអាសយដ្ឋានផ្លូវ។",
      city: "ត្រូវការទីក្រុង។",
      postalCode: "សូមបញ្ចូលលេខកូដប្រៃសណីយ៍ដែលត្រឹមត្រូវ។",
      country: "ត្រូវការប្រទេស។",
      cardName: "ត្រូវការឈ្មោះនៅលើកាត។",
      cardNumber: "សូមបញ្ចូលលេខកាតដែលត្រឹមត្រូវ។",
      cardExpiry: "សូមប្រើទម្រង់ ខែ/ឆ្នាំ។",
      cardCvc: "សូមបញ្ចូលលេខសម្ងាត់សុវត្ថិភាពដែលត្រឹមត្រូវ។",
    },
  },
  account: {
    notSignedInTitle: "អ្នកមិនទាន់ចូលគណនីទេ",
    notSignedInDesc: "ចូលគណនីដើម្បីមើលគណនីគំរូរបស់អ្នក ឬបង្កើតគណនីថ្មីក្នុងរយៈពេលប៉ុន្មានវិនាទី។",
    signIn: "ចូលគណនី",
    createAccount: "បង្កើតគណនី",
    sellerPrompt: "តើអ្នកជាអ្នកលក់ដែរឬទេ?",
    sellerLink: "ចូលទៅផ្ទាំងគ្រប់គ្រងអ្នកលក់",
    helloPrefix: "សួស្តី,",
    signOut: "ចាកចេញ",
    demoNotice: "នេះជាគណនីគំរូដែលរក្សាទុកតែនៅក្នុងកម្មវិធីរុករករបស់អ្នកប៉ុណ្ណោះ។ គ្មានទិន្នន័យអតិថិជនពិតប្រាកដត្រូវបានប្រមូលទេ។",
    sellerBannerText: "អ្នកបានចូលគណនីជាមួយសិទ្ធិអ្នកលក់។",
    sellerDashboardButton: "ផ្ទាំងគ្រប់គ្រងអ្នកលក់",
    orderHistory: "ប្រវត្តិការកុម្ម៉ង់",
    noOrdersTitle: "មិនទាន់មានការកុម្ម៉ង់ទេ",
    noOrdersDesc: "ការកុម្ម៉ង់គំរូរបស់អ្នកនឹងបង្ហាញនៅទីនេះ បន្ទាប់ពីការទូទាត់។",
    startShopping: "ចាប់ផ្តើមទិញទំនិញ",
    profile: "ព័ត៌មានផ្ទាល់ខ្លួន",
    name: "ឈ្មោះ",
    email: "អ៊ីមែល",
    viewWishlist: "មើលបញ្ជីចង់បានរបស់អ្នក",
    signedOut: "អ្នកបានចាកចេញពីគណនីរួចរាល់។",
  },
  auth: {
    signInTitle: "ចូលគណនី TAMJIT",
    signInSubtitle: "គណនីគំរូ — សូមបញ្ចូលអ៊ីមែលណាមួយ និងពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ។",
    emailLabel: "អាសយដ្ឋានអ៊ីមែល",
    passwordLabel: "ពាក្យសម្ងាត់",
    signInButton: "ចូលគណនី",
    newToStore: "ថ្មីមកកាន់ TAMJIT?",
    createAccountLink: "បង្កើតគណនី",
    registerTitle: "បង្កើតគណនីរបស់អ្នក",
    registerSubtitle: "ការចុះឈ្មោះគំរូ — គ្មានទិន្នន័យចេញពីកម្មវិធីរុករករបស់អ្នកឡើយ។",
    fullNameLabel: "ឈ្មោះពេញ",
    passwordHint: "យ៉ាងតិច ៦ តួអក្សរ។",
    createAccountButton: "បង្កើតគណនី",
    alreadyHaveAccount: "មានគណនីរួចហើយ?",
    signInLink: "ចូលគណនី",
    welcomeBack: "សូមស្វាគមន៍ការត្រឡប់មកវិញ!",
    invalidCredentials: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ និងពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ។",
    nameRequired: "សូមបញ្ចូលឈ្មោះរបស់អ្នក។",
    invalidEmail: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ។",
    passwordTooShort: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ។",
    accountCreated: "គណនីត្រូវបានបង្កើតរួចរាល់ — សូមស្វាគមន៍មកកាន់ TAMJIT។",
  },
  wishlist: {
    title: "បញ្ជីចង់បានរបស់អ្នក",
    countSuffix: "ផលិតផលបានរក្សាទុក",
    emptyTitle: "បញ្ជីចង់បានរបស់អ្នកទទេ",
    emptyDesc: "រក្សាទុកផលិតផលដែលអ្នកចូលចិត្ត ហើយវានឹងបង្ហាញនៅទីនេះ។",
    discoverProducts: "រកមើលផលិតផល",
    addToBag: "ដាក់ចូលកន្ត្រក",
  },
  notFound: {
    heading: "រកមិនឃើញទំព័រទេ",
    description: "ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬប្រហែលជាត្រូវបានផ្លាស់ទី។",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
  },
  routineFinder: {
    breadcrumb: "ស្វែងរករបបថែទាំ",
    eyebrow: "ស្បែករបស់អ្នក របបថែទាំរបស់អ្នក",
    titleStart: "កន្លែងសាមញ្ញមួយសម្រាប់",
    titleItalic: "ចាប់ផ្តើម",
    description:
      "ប្រាប់យើងអំពីស្បែករបស់អ្នក និងអ្វីដែលអ្នកចង់បានជំនួយ។ យើងនឹងរៀបចំចំណុចចាប់ផ្តើមគិតគូរចំនួនបីពីបណ្តុំផលិតផលរបស់យើង។",
    quickCheckLabel: "ពិនិត្យស្បែកយ៉ាងលឿន",
    oneMinute: "១ នាទី",
    stepsLabel: "ប្រភេទស្បែក / គោលដៅចម្បង / ជម្រើសរបស់អ្នក",
    sectionEyebrow: "តោះស្គាល់ស្បែករបស់អ្នក",
    sectionTitle: "តើមួយណាស្រដៀងនឹងអ្នកបំផុត?",
    skinTypeQuestion: "តើអ្នកពិពណ៌នាអំពីស្បែករបស់អ្នកយ៉ាងណា?",
    concernQuestion: "តើអ្នកចង់ផ្តោតលើអ្វី?",
    buildButton: "បង្កើតរបបថែទាំរបស់ខ្ញុំ",
    noSignup: "មិនចាំបាច់ចុះឈ្មោះទេ",
    disclaimer:
      "នេះជាចំណុចចាប់ផ្តើមមានប្រយោជន៍ មិនមែនជាដំបូន្មានវេជ្ជសាស្ត្រទេ។ ប្រសិនបើអ្នកមានបញ្ហាស្បែកជាប់លាប់ គ្រូពេទ្យស្បែកអាចផ្តល់ដំបូន្មានសមស្របសម្រាប់អ្នក។",
    skinTypes: [
      { label: "ស្បែកស្ងួត", note: "ជាញឹកញាប់មានអារម្មណ៍តឹង ឬសាច់ស្បែកបក" },
      { label: "ស្បែកមូន", note: "មានពន្លឺភ្លឺកម្រិតខ្ពស់ពេញមួយថ្ងៃ" },
      { label: "ស្បែកលាយ", note: "មូននៅតំបន់ខ្លះ ស្ងួតនៅតំបន់ផ្សេងទៀត" },
      { label: "ស្បែកប្រែប្រួល", note: "អាចមានប្រតិកម្ម ឬរលាកងាយស្រួល" },
      { label: "មិនទាន់ប្រាកដ", note: "បង្ហាញខ្ញុំនូវជម្រើសទន់ភ្លន់ និងមានតុល្យភាព" },
    ],
    concerns: [
      { label: "សំណើមបន្ថែម", note: "" },
      { label: "ភាពស្ងប់ស្ងាត់ និងកក់ក្តៅ", note: "" },
      { label: "ស្បែកភ្លឺថ្លា និងស្មើគ្នា", note: "" },
      { label: "តុល្យភាព និងរន្ធញើសស្អាត", note: "" },
      { label: "កាត់បន្ថយស្នាមជ្រីវជ្រួញ", note: "" },
      { label: "ការពារកម្តៅថ្ងៃប្រចាំថ្ងៃ", note: "" },
    ],
    concernNote: "យើងនឹងផ្តល់អាទិភាពដល់ផលិតផលដែលគាំទ្រគោលដៅនេះ",
    resultsEyebrow: "រៀបចំសម្រាប់ចម្លើយរបស់អ្នក",
    resultsTitle: "របបថែទាំប្រចាំថ្ងៃសាមញ្ញរបស់អ្នក",
    resultsDescPrefix: "ចំណុចចាប់ផ្តើមគិតគូរសម្រាប់ស្បែក",
    resultsDescMiddle: "ដោយផ្តោតលើ",
    editAnswers: "កែសម្រួលចម្លើយរបស់ខ្ញុំ",
    steps: ["០១ · លាង", "០២ · ព្យាបាល", "០៣ · ផ្តល់សំណើម", "០៤ · ការពារ"],
    noMatch: "យើងរកមិនឃើញការផ្គូផ្គងពេញលេញទេ។ សូមសាកល្បង “មិនទាន់ប្រាកដ” សម្រាប់ជម្រើសទូលំទូលាយជាង។",
    ctaTitle: "ថ្ងៃស្បែកល្អ ជាមួយជំហានម្តងមួយៗ",
    ctaDesc: "រកមើលបណ្តុំផលិតផលពេញលេញនៅពេលអ្នកត្រៀមខ្លួន។",
    browseAll: "រកមើលទាំងអស់",
  },
  footer: {
    description: "ការថែរក្សាស្បែកគិតគូរយ៉ាងម៉ត់ចត់ ផលិតពីរុក្ខជាតិស្អាតស្អំនិងមានប្រសិទ្ធភាព។ ផលិតជាបាច់តូច បញ្ជីសារធាតុស្មោះត្រង់ គ្មានករណីលើកលែង។",
    veganCrueltyFree: "ផលិតផលបួស និងគ្មានការសាកល្បងលើសត្វ",
    shopColumn: "ហាង",
    helpColumn: "ជំនួយ",
    companyColumn: "ក្រុមហ៊ុន",
    cleansers: "ទឹកលាងមុខ",
    serums: "សេរ៉ូម",
    moisturizers: "ក្រែមផ្តល់សំណើម",
    sunCare: "ការពារកម្តៅថ្ងៃ",
    routineFinder: "ស្វែងរករបបថែទាំ",
    storeInformation: "ព័ត៌មានហាង",
    findYourRoutine: "ស្វែងរករបបថែទាំរបស់អ្នក",
    shopAll: "ទំនិញទាំងអស់",
    ourStory: "រឿងរ៉ាវរបស់យើង",
    ingredients: "សារធាតុផ្សំ",
    sustainability: "និរន្តរភាព",
    wishlist: "បញ្ជីចង់បាន",
    sellerLogin: "ចូលគណនីអ្នកលក់",
    joinList: "ចុះឈ្មោះទទួលព័ត៌មាន",
    joinDesc: "ទទួលបានព័ត៌មានមុនគេអំពីរូបមន្តថ្មី និងការបញ្ចុះតម្លៃ ១០% សម្រាប់ការកុម្ម៉ង់ដំបូង។",
    emailPlaceholder: "you@example.com",
    join: "ចុះឈ្មោះ",
    copyright: "ហាង TAMJIT។ រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    demoNotice: "នេះជាហាងគំរូ។ គ្មានការកុម្ម៉ង់ ឬការទូទាត់ប្រាក់ពិតប្រាកដត្រូវបានដំណើរការទេ។",
  },
};

export const translations: Record<Language, Translations> = { en, km };

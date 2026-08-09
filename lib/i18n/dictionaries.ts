import type { Locale } from "./config"

const en = {
  "meta.description":
    "Thelaryon — search and manage your Magic: The Gathering collection with live prices.",

  "nav.home": "Home",
  "nav.search": "Search",
  "nav.collection": "Collection",
  "nav.friends": "Friends",
  "nav.profile": "Profile",
  "nav.desktopAria": "Desktop navigation",
  "nav.mobileAria": "Main navigation",
  "nav.language": "Language",

  "home.welcomeBack":
    "Welcome back, {name}. Search printings and manage your collection.",
  "home.tagline":
    "Search printings, manage your collection, and track prices.",
  "home.searchCards": "Search cards",
  "home.viewCollection": "View collection",
  "home.createAccount": "Create account",
  "home.statCards": "Cards",
  "home.statUnique": "Unique",
  "home.statCollectionValue": "Collection value",
  "home.statProfitLoss": "Profit/loss",
  "home.searchTitle": "Search",
  "home.searchBody": "Find printings and EUR prices via Scryfall.",
  "home.collectionTitle": "Collection",
  "home.collectionBodyLoggedIn":
    "Manage quantity, condition, finish, and purchase price.",
  "home.collectionBodyLoggedOut": "Sign in to manage your personal collection.",

  "collection.title": "Collection",
  "collection.description":
    "Your Magic: The Gathering collection. Add cards via search or card detail pages.",
  "collection.searchCards": "Search cards",
  "collection.statCards": "Cards",
  "collection.statUnique": "Unique",
  "collection.statCollectionValue": "Collection value",
  "collection.statPurchaseValue": "Purchase value",
  "collection.emptyTitle": "Your collection is empty",
  "collection.emptyDescription": "Search for your first card to get started.",

  "search.title": "Search cards",
  "search.description":
    "Search Magic: The Gathering cards by name. Open a result for details and prices.",
  "search.label": "Search Magic cards",
  "search.placeholder": "Search by card name, set, or collector number…",
  "search.hint": "Search via Scryfall. Results appear after a short pause.",
  "search.idleTitle": "Start searching",
  "search.idleDescription":
    "Type a card name to find Magic: The Gathering printings.",
  "search.loading": "Searching for “{query}”…",
  "search.errorTitle": "Search failed",
  "search.errorFallback": "Search failed.",
  "search.errorRetry": "Search failed. Please try again.",
  "search.emptyTitle": "No results",
  "search.emptyDescription":
    "No cards found for “{query}”. Try a different search term.",
  "search.resultsOne": "1 result for “{query}”",
  "search.resultsMany": "{count} results for “{query}”",

  "card.backToSearch": "← Back to search",
  "card.loginPrompt": "Sign in to quickly add this card to your collection.",
  "card.signIn": "Sign in",
  "card.signUp": "Sign up",
  "card.noImage": "No image",
  "card.unknownFinish": "Unknown",
  "card.rarity": "Rarity",
  "card.finishes": "Finishes",
  "card.eurPrice": "EUR price",
  "card.eurFoil": "EUR foil",
  "card.priceDisclaimer":
    "Scryfall prices are a market indication, not a guaranteed sale value.",
  "card.foilPrefix": "Foil {price}",
  "card.metadataFallbackTitle": "Card",

  "notFound.title": "Card not found",
  "notFound.description":
    "This card does not exist or is no longer available via Scryfall.",
  "notFound.back": "Back to search",

  "profile.title": "Profile",
  "profile.description": "Manage your Thelaryon account.",
  "profile.name": "Name",
  "profile.email": "Email",
  "profile.toCollection": "Go to collection",
  "profile.signOut": "Sign out",
  "profile.language": "Language",
  "profile.languageHint":
    "Defaults to English. Dutch is used when your browser language is Dutch, or when you choose it here.",
  "profile.languageEn": "English",
  "profile.languageNl": "Nederlands",

  "friends.title": "Friends",
  "friends.description":
    "Add friends by email and compare collections to spot trade opportunities.",
  "friends.addTitle": "Add a friend",
  "friends.addHint":
    "They must already have a Thelaryon account. Use the email they signed up with.",
  "friends.email": "Friend’s email",
  "friends.sendRequest": "Send request",
  "friends.sending": "Sending…",
  "friends.pendingIncoming": "Incoming requests",
  "friends.pendingOutgoing": "Sent requests",
  "friends.accepted": "Your friends",
  "friends.emptyFriends": "No friends yet. Send a request to get started.",
  "friends.emptyIncoming": "No incoming requests.",
  "friends.emptyOutgoing": "No pending sent requests.",
  "friends.incomingBanner":
    "You have {count} incoming friend request(s). Accept or decline them below.",
  "friends.accept": "Accept",
  "friends.decline": "Decline",
  "friends.remove": "Remove",
  "friends.compare": "Compare collections",
  "friends.pendingLabel": "Pending",
  "friends.requestSent": "Friend request sent.",
  "friends.requestAccepted": "Friend request accepted.",
  "friends.requestDeclined": "Friend request declined.",
  "friends.removed": "Friend removed.",
  "friends.errorInvalidEmail": "Enter a valid email address.",
  "friends.errorUserNotFound": "No Thelaryon user found with that email.",
  "friends.errorSelf": "You can’t add yourself.",
  "friends.errorAlreadyFriends": "You’re already friends.",
  "friends.errorAlreadyPending": "A friend request is already pending.",
  "friends.errorNotFound": "Friendship not found.",
  "friends.errorForbidden": "You’re not allowed to do that.",
  "friends.errorNotPending": "This request is no longer pending.",
  "friends.errorGeneric": "Something went wrong. Please try again.",
  "friends.compareTitle": "Compare with {name}",
  "friends.compareBack": "← Back to friends",
  "friends.compareForbidden":
    "You can only compare collections with accepted friends.",
  "friends.statMissingForMe": "They have, you don’t",
  "friends.statExtras": "Their extras you need",
  "friends.statMissingForThem": "You have, they don’t",
  "friends.sectionExtras": "Trade targets — their extras (qty ≥ 2) you don’t own",
  "friends.sectionExtrasHint":
    "These are cards your friend owns more than one of, that are missing from your collection.",
  "friends.sectionMissingForMe": "All cards they have that you don’t",
  "friends.sectionMissingForThem": "Cards you have that they don’t",
  "friends.emptySection": "Nothing here right now.",
  "friends.theirQty": "Them: {count}",
  "friends.yourQty": "You: {count}",
  "friends.extrasBadge": "{count} extra",
  "friends.viewCard": "View",

  "auth.signIn.title": "Sign in",
  "auth.signIn.description":
    "Sign in with your email to manage your collection.",
  "auth.signIn.email": "Email",
  "auth.signIn.password": "Password",
  "auth.signIn.submit": "Sign in",
  "auth.signIn.pending": "Signing in…",
  "auth.signIn.noAccount": "No account yet?",
  "auth.signIn.registerLink": "Sign up",
  "auth.signIn.missingFields": "Enter your email and password.",
  "auth.signIn.failed": "Sign-in failed.",

  "auth.signUp.title": "Create account",
  "auth.signUp.description":
    "Register with your email to save your collection.",
  "auth.signUp.name": "Name",
  "auth.signUp.email": "Email",
  "auth.signUp.password": "Password",
  "auth.signUp.submit": "Sign up",
  "auth.signUp.pending": "Creating account…",
  "auth.signUp.hasAccount": "Already have an account?",
  "auth.signUp.signInLink": "Sign in",
  "auth.signUp.missingFields": "Enter your name, email, and password.",
  "auth.signUp.passwordLength": "Password must be at least 8 characters.",
  "auth.signUp.failed": "Could not create account.",

  "quickAdd.title": "Quick add",
  "quickAdd.description": "1× Near Mint · English. No extra options needed.",
  "quickAdd.adding": "Adding…",
  "quickAdd.finishNonFoil": "Non-foil",
  "quickAdd.finishNonFoilShort": "NM",
  "quickAdd.finishFoil": "Foil",
  "quickAdd.finishEtched": "Etched",
  "quickAdd.addFinish": "+ {finish}",
  "quickAdd.addDefault": "+ Add",
  "quickAdd.addedCompact": "Added to collection",
  "quickAdd.failedCompact": "Could not add",
  "quickAdd.signInToAdd": "Sign in to add",

  "customAdd.title": "Custom add",
  "customAdd.description":
    "Change quantity, condition, language, or purchase price.",
  "customAdd.open": "Open",
  "customAdd.close": "Close",
  "customAdd.quantity": "Quantity",
  "customAdd.condition": "Condition",
  "customAdd.finish": "Finish",
  "customAdd.language": "Language",
  "customAdd.purchasePrice": "Purchase price (EUR)",
  "customAdd.purchaseDate": "Purchase date",
  "customAdd.optional": "Optional",
  "customAdd.submit": "Add to collection",
  "customAdd.adding": "Adding…",

  "collectionItem.quantity": "Quantity",
  "collectionItem.condition": "Condition",
  "collectionItem.finish": "Finish",
  "collectionItem.purchasePrice": "Purchase price",
  "collectionItem.optional": "Optional",
  "collectionItem.save": "Save",
  "collectionItem.saving": "Saving…",
  "collectionItem.cancel": "Cancel",
  "collectionItem.qty": "Qty",
  "collectionItem.price": "Price",
  "collectionItem.edit": "Edit",
  "collectionItem.delete": "Delete",
  "collectionItem.deleting": "…",
  "collectionItem.noImage": "No image",
  "collectionItem.deleteFailed": "Could not delete. Please try again.",
  "collectionItem.updateFailed": "Could not update. Please try again.",

  "price.unavailable": "No price available",

  "action.loginRequired": "Sign in to manage your collection.",
  "action.invalidCollectionData": "Invalid collection data.",
  "action.added": "{name} was added to your collection.",
  "action.addFailed": "Could not add the card. Please try again.",
  "action.invalidChanges": "Invalid changes.",
  "action.itemNotFound": "Collection item not found.",
  "action.updated": "Collection item updated.",
  "action.updateFailed": "Could not update. Please try again.",
  "action.deleted": "Card removed from your collection.",
  "action.deleteFailed": "Could not delete. Please try again.",
  "action.invalidPurchaseDate": "Invalid purchase date.",

  "api.invalidSearchQuery": "Provide a valid search query.",
  "api.searchFailed": "Card search failed.",
  "api.invalidCardId": "Invalid card id.",
  "api.cardNotFound": "Card not found.",
  "api.cardFetchFailed": "Could not load card.",
  "api.unauthorized": "Sign in required.",
  "api.invalidBody": "Invalid request body.",
  "api.collectionFailed": "Collection request failed.",
} as const

export type MessageKey = keyof typeof en

const nl: Record<MessageKey, string> = {
  "meta.description":
    "Thelaryon — zoek en beheer je Magic: The Gathering collectie met actuele prijzen.",

  "nav.home": "Home",
  "nav.search": "Zoeken",
  "nav.collection": "Collectie",
  "nav.friends": "Vrienden",
  "nav.profile": "Profiel",
  "nav.desktopAria": "Desktop navigatie",
  "nav.mobileAria": "Hoofdnavigatie",
  "nav.language": "Taal",

  "home.welcomeBack":
    "Welkom terug, {name}. Zoek printings en beheer je collectie.",
  "home.tagline":
    "Zoek printings, beheer je collectie en houd prijzen bij.",
  "home.searchCards": "Zoek kaarten",
  "home.viewCollection": "Bekijk collectie",
  "home.createAccount": "Account maken",
  "home.statCards": "Kaarten",
  "home.statUnique": "Uniek",
  "home.statCollectionValue": "Collectiewaarde",
  "home.statProfitLoss": "Winst/verlies",
  "home.searchTitle": "Zoeken",
  "home.searchBody": "Vind printings en EUR-prijzen via Scryfall.",
  "home.collectionTitle": "Collectie",
  "home.collectionBodyLoggedIn":
    "Beheer quantity, condition, finish en aankoopprijs.",
  "home.collectionBodyLoggedOut":
    "Log in om je persoonlijke collectie te beheren.",

  "collection.title": "Collectie",
  "collection.description":
    "Jouw Magic: The Gathering collectie. Voeg kaarten toe via zoeken of detailpagina’s.",
  "collection.searchCards": "Zoek kaarten",
  "collection.statCards": "Kaarten",
  "collection.statUnique": "Uniek",
  "collection.statCollectionValue": "Collectiewaarde",
  "collection.statPurchaseValue": "Aankoopwaarde",
  "collection.emptyTitle": "Je collectie is leeg",
  "collection.emptyDescription": "Zoek je eerste kaart om te beginnen.",

  "search.title": "Kaarten zoeken",
  "search.description":
    "Zoek Magic: The Gathering kaarten op naam. Klik op een resultaat voor details en prijzen.",
  "search.label": "Zoek Magic-kaarten",
  "search.placeholder": "Zoek op kaartnaam, set of collector number…",
  "search.hint":
    "Zoeken via Scryfall. Resultaten verschijnen na een korte pauze.",
  "search.idleTitle": "Begin met zoeken",
  "search.idleDescription":
    "Typ een kaartnaam om Magic: The Gathering printings te vinden.",
  "search.loading": "Zoeken naar “{query}”…",
  "search.errorTitle": "Zoeken mislukt",
  "search.errorFallback": "Zoeken is mislukt.",
  "search.errorRetry": "Zoeken is mislukt. Probeer het opnieuw.",
  "search.emptyTitle": "Geen resultaten",
  "search.emptyDescription":
    "Geen kaarten gevonden voor “{query}”. Probeer een andere zoekterm.",
  "search.resultsOne": "1 resultaat voor “{query}”",
  "search.resultsMany": "{count} resultaten voor “{query}”",

  "card.backToSearch": "← Terug naar zoeken",
  "card.loginPrompt":
    "Log in om deze kaart snel aan je collectie toe te voegen.",
  "card.signIn": "Inloggen",
  "card.signUp": "Registreren",
  "card.noImage": "Geen afbeelding",
  "card.unknownFinish": "Onbekend",
  "card.rarity": "Rarity",
  "card.finishes": "Finishes",
  "card.eurPrice": "EUR prijs",
  "card.eurFoil": "EUR foil",
  "card.priceDisclaimer":
    "Prijzen via Scryfall zijn een marktindicatie, geen gegarandeerde verkoopwaarde.",
  "card.foilPrefix": "Foil {price}",
  "card.metadataFallbackTitle": "Kaart",

  "notFound.title": "Kaart niet gevonden",
  "notFound.description":
    "Deze kaart bestaat niet of is niet meer beschikbaar via Scryfall.",
  "notFound.back": "Terug naar zoeken",

  "profile.title": "Profiel",
  "profile.description": "Beheer je Thelaryon-account.",
  "profile.name": "Naam",
  "profile.email": "E-mail",
  "profile.toCollection": "Naar collectie",
  "profile.signOut": "Uitloggen",
  "profile.language": "Taal",
  "profile.languageHint":
    "Standaard Engels. Nederlands als je browser op Nederlands staat, of als je het hier kiest.",
  "profile.languageEn": "English",
  "profile.languageNl": "Nederlands",

  "friends.title": "Vrienden",
  "friends.description":
    "Voeg vrienden toe via e-mail en vergelijk collecties om ruilmogelijkheden te zien.",
  "friends.addTitle": "Vriend toevoegen",
  "friends.addHint":
    "Ze moeten al een Thelaryon-account hebben. Gebruik het e-mailadres waarmee ze zich hebben geregistreerd.",
  "friends.email": "E-mail van vriend",
  "friends.sendRequest": "Verzoek sturen",
  "friends.sending": "Versturen…",
  "friends.pendingIncoming": "Binnenkomende verzoeken",
  "friends.pendingOutgoing": "Verstuurde verzoeken",
  "friends.accepted": "Jouw vrienden",
  "friends.emptyFriends": "Nog geen vrienden. Stuur een verzoek om te beginnen.",
  "friends.emptyIncoming": "Geen binnenkomende verzoeken.",
  "friends.emptyOutgoing": "Geen openstaande verstuurde verzoeken.",
  "friends.incomingBanner":
    "Je hebt {count} binnenkomend vriendschapsverzoek. Accepteer of weiger hieronder.",
  "friends.accept": "Accepteren",
  "friends.decline": "Weigeren",
  "friends.remove": "Verwijderen",
  "friends.compare": "Collecties vergelijken",
  "friends.pendingLabel": "In afwachting",
  "friends.requestSent": "Vriendschapsverzoek verstuurd.",
  "friends.requestAccepted": "Vriendschapsverzoek geaccepteerd.",
  "friends.requestDeclined": "Vriendschapsverzoek geweigerd.",
  "friends.removed": "Vriend verwijderd.",
  "friends.errorInvalidEmail": "Vul een geldig e-mailadres in.",
  "friends.errorUserNotFound": "Geen Thelaryon-gebruiker met dat e-mailadres.",
  "friends.errorSelf": "Je kunt jezelf niet toevoegen.",
  "friends.errorAlreadyFriends": "Jullie zijn al vrienden.",
  "friends.errorAlreadyPending": "Er staat al een verzoek open.",
  "friends.errorNotFound": "Vriendschap niet gevonden.",
  "friends.errorForbidden": "Dat mag je niet doen.",
  "friends.errorNotPending": "Dit verzoek is niet meer openstaand.",
  "friends.errorGeneric": "Er ging iets mis. Probeer het opnieuw.",
  "friends.compareTitle": "Vergelijk met {name}",
  "friends.compareBack": "← Terug naar vrienden",
  "friends.compareForbidden":
    "Je kunt alleen collecties vergelijken met geaccepteerde vrienden.",
  "friends.statMissingForMe": "Zij wel, jij niet",
  "friends.statExtras": "Hun doubles die jij mist",
  "friends.statMissingForThem": "Jij wel, zij niet",
  "friends.sectionExtras": "Ruilkansen — hun doubles (qty ≥ 2) die jij niet hebt",
  "friends.sectionExtrasHint":
    "Kaarten waarvan je vriend er meer dan één heeft, en die jij nog niet bezit.",
  "friends.sectionMissingForMe": "Alles wat zij hebben en jij niet",
  "friends.sectionMissingForThem": "Kaarten die jij hebt en zij niet",
  "friends.emptySection": "Hier staat nu niets.",
  "friends.theirQty": "Zij: {count}",
  "friends.yourQty": "Jij: {count}",
  "friends.extrasBadge": "{count} extra",
  "friends.viewCard": "Bekijken",

  "auth.signIn.title": "Inloggen",
  "auth.signIn.description":
    "Log in met je e-mailadres om je collectie te beheren.",
  "auth.signIn.email": "E-mail",
  "auth.signIn.password": "Wachtwoord",
  "auth.signIn.submit": "Inloggen",
  "auth.signIn.pending": "Bezig…",
  "auth.signIn.noAccount": "Nog geen account?",
  "auth.signIn.registerLink": "Registreren",
  "auth.signIn.missingFields": "Vul e-mail en wachtwoord in.",
  "auth.signIn.failed": "Inloggen mislukt.",

  "auth.signUp.title": "Account maken",
  "auth.signUp.description":
    "Registreer met je e-mailadres om je collectie te bewaren.",
  "auth.signUp.name": "Naam",
  "auth.signUp.email": "E-mail",
  "auth.signUp.password": "Wachtwoord",
  "auth.signUp.submit": "Registreren",
  "auth.signUp.pending": "Account aanmaken…",
  "auth.signUp.hasAccount": "Al een account?",
  "auth.signUp.signInLink": "Log in",
  "auth.signUp.missingFields": "Vul naam, e-mail en wachtwoord in.",
  "auth.signUp.passwordLength": "Wachtwoord moet minimaal 8 tekens zijn.",
  "auth.signUp.failed": "Account aanmaken mislukt.",

  "quickAdd.title": "Snel toevoegen",
  "quickAdd.description": "1× Near Mint · Engels. Geen extra opties nodig.",
  "quickAdd.adding": "Toevoegen…",
  "quickAdd.finishNonFoil": "Non-foil",
  "quickAdd.finishNonFoilShort": "NM",
  "quickAdd.finishFoil": "Foil",
  "quickAdd.finishEtched": "Etched",
  "quickAdd.addFinish": "+ {finish}",
  "quickAdd.addDefault": "+ Toevoegen",
  "quickAdd.addedCompact": "Toegevoegd aan collectie",
  "quickAdd.failedCompact": "Toevoegen mislukt",
  "quickAdd.signInToAdd": "Log in om toe te voegen",

  "customAdd.title": "Aangepast toevoegen",
  "customAdd.description":
    "Aantal, conditie, taal of aankoopprijs wijzigen.",
  "customAdd.open": "Openen",
  "customAdd.close": "Sluiten",
  "customAdd.quantity": "Aantal",
  "customAdd.condition": "Conditie",
  "customAdd.finish": "Finish",
  "customAdd.language": "Taal",
  "customAdd.purchasePrice": "Aankoopprijs (EUR)",
  "customAdd.purchaseDate": "Aankoopdatum",
  "customAdd.optional": "Optioneel",
  "customAdd.submit": "Toevoegen aan collectie",
  "customAdd.adding": "Toevoegen…",

  "collectionItem.quantity": "Aantal",
  "collectionItem.condition": "Conditie",
  "collectionItem.finish": "Finish",
  "collectionItem.purchasePrice": "Aankoopprijs",
  "collectionItem.optional": "Optioneel",
  "collectionItem.save": "Opslaan",
  "collectionItem.saving": "Opslaan…",
  "collectionItem.cancel": "Annuleer",
  "collectionItem.qty": "Aantal",
  "collectionItem.price": "Prijs",
  "collectionItem.edit": "Bewerken",
  "collectionItem.delete": "Verwijderen",
  "collectionItem.deleting": "…",
  "collectionItem.noImage": "Geen afbeelding",
  "collectionItem.deleteFailed": "Verwijderen mislukt. Probeer het opnieuw.",
  "collectionItem.updateFailed": "Wijzigen mislukt. Probeer het opnieuw.",

  "price.unavailable": "Geen prijs beschikbaar",

  "action.loginRequired": "Log in om je collectie te beheren.",
  "action.invalidCollectionData": "Ongeldige collectiegegevens.",
  "action.added": "{name} is toegevoegd aan je collectie.",
  "action.addFailed": "Kaart kon niet worden toegevoegd. Probeer het opnieuw.",
  "action.invalidChanges": "Ongeldige wijzigingen.",
  "action.itemNotFound": "Collectie-item niet gevonden.",
  "action.updated": "Collectie-item bijgewerkt.",
  "action.updateFailed": "Wijzigen mislukt. Probeer het opnieuw.",
  "action.deleted": "Kaart verwijderd uit je collectie.",
  "action.deleteFailed": "Verwijderen mislukt. Probeer het opnieuw.",
  "action.invalidPurchaseDate": "Ongeldige aankoopdatum.",

  "api.invalidSearchQuery": "Geef een geldige zoekopdracht op.",
  "api.searchFailed": "Kaartzoeken is mislukt.",
  "api.invalidCardId": "Ongeldig kaart-id.",
  "api.cardNotFound": "Kaart niet gevonden.",
  "api.cardFetchFailed": "Kaart kon niet worden geladen.",
  "api.unauthorized": "Inloggen vereist.",
  "api.invalidBody": "Ongeldige request body.",
  "api.collectionFailed": "Collectieverzoek mislukt.",
}

const dictionaries: Record<Locale, Record<MessageKey, string>> = {
  en,
  nl,
}

export type TranslateParams = Record<string, string | number>

export function getDictionary(locale: Locale): Record<MessageKey, string> {
  return dictionaries[locale]
}

export function createTranslator(locale: Locale) {
  const dictionary = getDictionary(locale)

  return function t(key: MessageKey, params?: TranslateParams): string {
    let value = dictionary[key] ?? dictionaries.en[key] ?? key

    if (params) {
      for (const [name, replacement] of Object.entries(params)) {
        value = value.replaceAll(`{${name}}`, String(replacement))
      }
    }

    return value
  }
}

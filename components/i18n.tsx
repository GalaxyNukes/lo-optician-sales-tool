'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { BLOCK_META } from './types'

export type Lang = 'nl' | 'fr' | 'en'
export type BriefingOptionKey =
  | 'bannerMaterials'
  | 'printPaper'
  | 'orientation'
  | 'socialPlatforms'
  | 'videoTypes'
  | 'videoDurations'

const STORAGE_KEY = 'lo-language'

const translations = {
  nl: {
    nav: {
      builder: 'Campagnebouwer',
      library: 'Bibliotheek',
      languages: { nl: 'NL', fr: 'FR', en: 'EN' },
    },
    common: {
      continue: 'Doorgaan →',
      chooseOne: 'Kies er één uit...',
      chooseShort: 'Kies...',
      notApplicable: 'Niet van toepassing',
      close: 'Sluiten',
      adjust: 'Aanpassen',
      remove: 'Verwijder',
      noData: '—',
      optional: 'optioneel',
    },
    preview: {
      banner: 'Conceptvoorbeeld actief',
      exit: 'Voorbeeld afsluiten',
    },
    client: {
      title: 'Gegevens opticien',
      completed: 'Gegevens ingevuld',
      region: 'Regio / land',
      shopName: 'Naam winkel',
      shopCity: 'Stad winkel',
      shopNamePlaceholder: 'Bijv. Optica Janssen',
      shopCityPlaceholder: 'Bijv. Gent',
    },
    steps: {
      goalQuestion: 'Wat is het doel van de marketing?',
      actionQuestion: 'Welke acties zijn hieraan verbonden?',
      needQuestion: 'Wat heb je nodig?',
      customActionLabel: 'Beschrijf je actie',
      customActionPlaceholder: 'Bijv. gratis montuur bij aankoop van glazen...',
      validUntil: 'Tot wanneer is de actie geldig?',
      scopeQuestion: 'Is de actie enkel geldig in de winkel of ook online?',
      scope: {
        store: 'Enkel in de winkel',
        online: 'Ook online',
        na: 'Niet van toepassing',
      },
    },
    filters: {
      subjects: 'Onderwerpfilters',
      all: 'Alles',
      noAssets: 'Geen assets gevonden. Pas de filters aan.',
      noCampaigns: 'Geen campagnes gevonden. Pas de filters aan.',
      view: 'Bekijk →',
    },
    bar: {
      chosenAssets: (count: number) => `${count} gekozen asset${count !== 1 ? 's' : ''}`,
      reset: 'Alles resetten',
      summarize: 'Pakket samenvatten',
    },
    detail: {
      type: 'Type',
      visualStyle: 'Vormgeving',
      formats: 'Formaten',
      season: 'Seizoen',
      includedFormats: 'Inbegrepen formaten',
      goals: 'Doelstellingen',
      added: '✓ Toegevoegd aan pakket',
      add: 'Toevoegen aan pakket',
      close: 'Sluiten',
      items: 'items',
      mockupAlt: (index: number) => `Mockup ${index}`,
    },
    library: {
      campaignCount: (count: number) => `${count} campagnes`,
    },
    summary: {
      title: 'Jouw campagnepakket',
      selectedAssets: (count: number) => `${count} asset${count !== 1 ? 's' : ''} geselecteerd`,
      campaignFilters: 'Campagne & filters',
      selectedAssetsLabel: 'Geselecteerde assets',
      briefingPerCampaign: 'Briefingdetails per campagne',
      noFilters: 'Geen filters geselecteerd.',
      noBlocks: 'Geen briefing blokken.',
      noFields: 'Nog geen velden ingevuld',
      extraNotes: 'Extra opmerkingen',
      extraNotesPlaceholder: 'Voeg hier eventuele extra opmerkingen toe voor het marketingteam...',
      generate: 'Briefing genereren →',
      goal: 'Doel',
      action: 'Actie',
      validUntil: 'Geldig tot',
      scope: 'Kanaal',
      need: 'Behoefte',
      subjects: 'Onderwerpen',
      deadline: 'Deadline',
      liveDate: 'Live datum',
      description: 'Omschrijving',
      docTitle: 'Campagnebriefing',
      createdOn: 'Aangemaakt op',
      shopName: 'Naam winkel',
      city: 'Stad',
      region: 'Regio / land',
      campaignContext: 'Campagnecontext',
      background: 'Achtergrond',
      reference: 'Referentie',
      taskDeadline: 'Deadline taak',
      campaignBriefingCount: (count: number) => `Briefing per campagne (${count})`,
      extraNotesDoc: 'Extra opmerkingen',
      generatedVia: 'Gegenereerd via LensOnline Campaign Catalog',
      print: 'Afdrukken / Opslaan als PDF →',
      unknown: 'Onbekend',
      noDetails: 'Geen aanvullende details opgegeven',
      noBlocksDoc: 'Geen briefing blokken voor deze campagne.',
      blocks: (count: number) => `${count} blok${count !== 1 ? 'ken' : ''}`,
    },
    briefing: {
      title: 'Briefing',
      timing: 'Timing & omschrijving',
      deadline: 'Deadline taak *',
      liveDate: 'Live datum *',
      shortDescription: 'Beschrijf in max. 4 woorden *',
      shortDescriptionPlaceholder: 'Bijv. Zomercampagne sportbrillen',
      backgroundInfo: 'Meer achtergrondinformatie',
      backgroundPlaceholder: 'Bijv. scherm hangt achter de balie...',
      similarReference: 'Referentie naar gelijkaardige taak',
      perCampaign: 'Briefing per campagne',
      generalReferences: 'Algemene referentieafbeeldingen',
      addBlock: 'Blok toevoegen',
      noBlocks: 'Geen blokken. Voeg er een toe hieronder.',
      blockCount: (count: number) => `${count} blok${count !== 1 ? 'ken' : ''}`,
      uploadTitle: 'Klik om te uploaden',
      uploadRest: ' of sleep hier naartoe',
      uploadHint: 'JPG, PNG — max. 10MB',
      from: 'Van',
      until: 'Tot',
      addFormat: '+ Voeg formaat toe',
      deleteBlock: 'Verwijder blok',
      fields: {
        storefrontPhotos: "Foto's etalage / winkelgevel",
        window: 'Etalageraam',
        door: 'Deur',
        notes: 'Opmerkingen',
        bannerSize: 'Formaat (cm)',
        material: 'Materiaal',
        designWishes: 'Wat zijn je design wensen (niet)?',
        locationPhotos: "Locatiefoto's",
        paper: 'Papierformaat',
        quantity: 'Oplage',
        orientation: 'Oriëntatie',
        references: 'Referentieafbeeldingen',
        platforms: 'Platformen',
        campaignPeriod: 'Wat is de periode van de campagne?',
        websiteUrl: 'Website URL',
        subpage: 'Subpagina',
        videoType: 'Type video',
        duration: 'Duur',
        screenOrientation: 'Scherm oriëntatie',
        specialFormats: 'Speciale formaten',
        whereShown: 'Waar zal de video getoond worden',
        describeNeed: 'Beschrijf wat je nodig hebt',
        examples: "Indien je voorbeelden of foto's hebt, voeg deze dan toe aan de taak",
        extraInfo: 'Geef meer informatie',
      },
      placeholders: {
        stickerNotes: 'Bijv. raam is gebogen of deurlijst is zichtbaar...',
        printQuantity: 'Bijv. 500',
        bannerDesignWishes: 'Bijv. strak en minimalistisch, geen drukke achtergronden...',
        printDesignWishes: 'Bijv. veel witruimte, zeker geen prijsexplosies...',
        landingSubpage: '/zomer-actie',
        specialFormats: 'Indien van toepassing',
        videoPlacement: 'Bijv. etalagescherm, wachtzaal, social ads...',
        otherNeed: 'Controleer eerst of de deliverable niet in het keuzemenu staat.',
        otherExtraInfo: 'Extra context, plaatsing, timing of aandachtspunten...',
      },
    },
  },
  fr: {
    nav: {
      builder: 'Créateur de campagne',
      library: 'Bibliothèque',
      languages: { nl: 'NL', fr: 'FR', en: 'EN' },
    },
    common: {
      continue: 'Continuer →',
      chooseOne: 'Choisissez une option...',
      chooseShort: 'Choisir...',
      notApplicable: 'Non applicable',
      close: 'Fermer',
      adjust: 'Modifier',
      remove: 'Supprimer',
      noData: '—',
      optional: 'optionnel',
    },
    preview: {
      banner: 'Aperçu brouillon actif',
      exit: "Quitter l'aperçu",
    },
    client: {
      title: "Données de l'opticien",
      completed: 'Données complétées',
      region: 'Région / pays',
      shopName: 'Nom du magasin',
      shopCity: 'Ville du magasin',
      shopNamePlaceholder: 'Ex. Optica Janssen',
      shopCityPlaceholder: 'Ex. Gand',
    },
    steps: {
      goalQuestion: 'Quel est l’objectif marketing ?',
      actionQuestion: 'Quelles actions y sont liées ?',
      needQuestion: 'De quoi avez-vous besoin ?',
      customActionLabel: 'Décrivez votre action',
      customActionPlaceholder: 'Ex. monture gratuite à l’achat de verres...',
      validUntil: "Jusqu'à quand l'action est-elle valable ?",
      scopeQuestion: "L'action est-elle valable uniquement en magasin ou aussi en ligne ?",
      scope: {
        store: 'Uniquement en magasin',
        online: 'Aussi en ligne',
        na: 'Non applicable',
      },
    },
    filters: {
      subjects: 'Filtres sujet',
      all: 'Tout',
      noAssets: "Aucun asset trouvé. Ajustez les filtres.",
      noCampaigns: 'Aucune campagne trouvée. Ajustez les filtres.',
      view: 'Voir →',
    },
    bar: {
      chosenAssets: (count: number) => `${count} asset${count !== 1 ? 's' : ''} sélectionné${count !== 1 ? 's' : ''}`,
      reset: 'Tout réinitialiser',
      summarize: 'Résumer le pack',
    },
    detail: {
      type: 'Type',
      visualStyle: 'Style visuel',
      formats: 'Formats',
      season: 'Saison',
      includedFormats: 'Formats inclus',
      goals: 'Objectifs',
      added: '✓ Ajouté au pack',
      add: 'Ajouter au pack',
      close: 'Fermer',
      items: 'éléments',
      mockupAlt: (index: number) => `Mockup ${index}`,
    },
    library: {
      campaignCount: (count: number) => `${count} campagnes`,
    },
    summary: {
      title: 'Votre pack campagne',
      selectedAssets: (count: number) => `${count} asset${count !== 1 ? 's' : ''} sélectionné${count !== 1 ? 's' : ''}`,
      campaignFilters: 'Campagne & filtres',
      selectedAssetsLabel: 'Assets sélectionnés',
      briefingPerCampaign: 'Détails du briefing par campagne',
      noFilters: 'Aucun filtre sélectionné.',
      noBlocks: 'Aucun bloc de briefing.',
      noFields: 'Aucun champ encore rempli',
      extraNotes: 'Remarques supplémentaires',
      extraNotesPlaceholder: "Ajoutez ici d'éventuelles remarques supplémentaires pour l'équipe marketing...",
      generate: 'Générer le briefing →',
      goal: 'Objectif',
      action: 'Action',
      validUntil: "Valable jusqu'au",
      scope: 'Canal',
      need: 'Besoin',
      subjects: 'Sujets',
      deadline: 'Deadline',
      liveDate: 'Date de mise en ligne',
      description: 'Description',
      docTitle: 'Briefing campagne',
      createdOn: 'Créé le',
      shopName: 'Nom du magasin',
      city: 'Ville',
      region: 'Région / pays',
      campaignContext: 'Contexte campagne',
      background: 'Contexte',
      reference: 'Référence',
      taskDeadline: 'Deadline tâche',
      campaignBriefingCount: (count: number) => `Briefing par campagne (${count})`,
      extraNotesDoc: 'Remarques supplémentaires',
      generatedVia: 'Généré via LensOnline Campaign Catalog',
      print: 'Imprimer / Enregistrer en PDF →',
      unknown: 'Inconnu',
      noDetails: 'Aucun détail complémentaire indiqué',
      noBlocksDoc: 'Aucun bloc de briefing pour cette campagne.',
      blocks: (count: number) => `${count} bloc${count !== 1 ? 's' : ''}`,
    },
    briefing: {
      title: 'Briefing',
      timing: 'Timing & description',
      deadline: 'Deadline tâche *',
      liveDate: 'Date de mise en ligne *',
      shortDescription: 'Décrivez en max. 4 mots *',
      shortDescriptionPlaceholder: 'Ex. campagne été lunettes de sport',
      backgroundInfo: 'Plus de contexte',
      backgroundPlaceholder: 'Ex. écran suspendu derrière le comptoir...',
      similarReference: 'Référence vers une tâche similaire',
      perCampaign: 'Briefing par campagne',
      generalReferences: 'Images de référence générales',
      addBlock: 'Ajouter un bloc',
      noBlocks: 'Aucun bloc. Ajoutez-en un ci-dessous.',
      blockCount: (count: number) => `${count} bloc${count !== 1 ? 's' : ''}`,
      uploadTitle: 'Cliquez pour téléverser',
      uploadRest: ' ou glissez ici',
      uploadHint: 'JPG, PNG — max. 10MB',
      from: 'Du',
      until: 'Au',
      addFormat: '+ Ajouter un format',
      deleteBlock: 'Supprimer le bloc',
      fields: {
        storefrontPhotos: 'Photos vitrine / façade',
        window: 'Vitrine',
        door: 'Porte',
        notes: 'Remarques',
        bannerSize: 'Format (cm)',
        material: 'Matériau',
        designWishes: 'Quels sont vos souhaits de design (ou non) ?',
        locationPhotos: 'Photos du lieu',
        paper: 'Format papier',
        quantity: 'Quantité',
        orientation: 'Orientation',
        references: 'Images de référence',
        platforms: 'Plateformes',
        campaignPeriod: 'Quelle est la période de la campagne ?',
        websiteUrl: 'URL du site',
        subpage: 'Sous-page',
        videoType: 'Type de vidéo',
        duration: 'Durée',
        screenOrientation: 'Orientation écran',
        specialFormats: 'Formats spéciaux',
        whereShown: 'Où la vidéo sera-t-elle diffusée',
        describeNeed: 'Décrivez ce dont vous avez besoin',
        examples: "Si vous avez des exemples ou des photos, ajoutez-les à la tâche",
        extraInfo: "Donnez plus d'informations",
      },
      placeholders: {
        stickerNotes: 'Ex. la vitrine est courbée ou le cadre de porte est visible...',
        printQuantity: 'Ex. 500',
        bannerDesignWishes: 'Ex. épuré et minimaliste, sans arrière-plans chargés...',
        printDesignWishes: "Ex. beaucoup d'espace blanc, surtout pas d'explosions de prix...",
        landingSubpage: '/action-ete',
        specialFormats: 'Si applicable',
        videoPlacement: "Ex. écran vitrine, salle d'attente, social ads...",
        otherNeed: "Vérifiez d'abord si le livrable n'est pas déjà dans le menu de sélection.",
        otherExtraInfo: 'Contexte supplémentaire, emplacement, timing ou points d’attention...',
      },
    },
  },
  en: {
    nav: {
      builder: 'Campaign Builder',
      library: 'Library',
      languages: { nl: 'NL', fr: 'FR', en: 'EN' },
    },
    common: {
      continue: 'Continue →',
      chooseOne: 'Choose one...',
      chooseShort: 'Choose...',
      notApplicable: 'Not applicable',
      close: 'Close',
      adjust: 'Adjust',
      remove: 'Remove',
      noData: '—',
      optional: 'optional',
    },
    preview: {
      banner: 'Draft preview active',
      exit: 'Exit preview',
    },
    client: {
      title: 'Optician details',
      completed: 'Details completed',
      region: 'Region / country',
      shopName: 'Store name',
      shopCity: 'Store city',
      shopNamePlaceholder: 'E.g. Optica Janssen',
      shopCityPlaceholder: 'E.g. Ghent',
    },
    steps: {
      goalQuestion: 'What is the marketing goal?',
      actionQuestion: 'Which actions are linked to this?',
      needQuestion: 'What do you need?',
      customActionLabel: 'Describe your action',
      customActionPlaceholder: 'E.g. free frame with lens purchase...',
      validUntil: 'Until when is the action valid?',
      scopeQuestion: 'Is the action only valid in-store or also online?',
      scope: {
        store: 'In-store only',
        online: 'Also online',
        na: 'Not applicable',
      },
    },
    filters: {
      subjects: 'Subject filters',
      all: 'All',
      noAssets: 'No assets found. Adjust the filters.',
      noCampaigns: 'No campaigns found. Adjust the filters.',
      view: 'View →',
    },
    bar: {
      chosenAssets: (count: number) => `${count} chosen asset${count !== 1 ? 's' : ''}`,
      reset: 'Reset all',
      summarize: 'Summarize package',
    },
    detail: {
      type: 'Type',
      visualStyle: 'Visual style',
      formats: 'Formats',
      season: 'Season',
      includedFormats: 'Included formats',
      goals: 'Goals',
      added: '✓ Added to package',
      add: 'Add to package',
      close: 'Close',
      items: 'items',
      mockupAlt: (index: number) => `Mockup ${index}`,
    },
    library: {
      campaignCount: (count: number) => `${count} campaigns`,
    },
    summary: {
      title: 'Your campaign package',
      selectedAssets: (count: number) => `${count} asset${count !== 1 ? 's' : ''} selected`,
      campaignFilters: 'Campaign & filters',
      selectedAssetsLabel: 'Selected assets',
      briefingPerCampaign: 'Briefing details per campaign',
      noFilters: 'No filters selected.',
      noBlocks: 'No briefing blocks.',
      noFields: 'No fields filled in yet',
      extraNotes: 'Extra notes',
      extraNotesPlaceholder: 'Add any extra notes for the marketing team here...',
      generate: 'Generate briefing →',
      goal: 'Goal',
      action: 'Action',
      validUntil: 'Valid until',
      scope: 'Channel',
      need: 'Need',
      subjects: 'Subjects',
      deadline: 'Deadline',
      liveDate: 'Go-live date',
      description: 'Description',
      docTitle: 'Campaign briefing',
      createdOn: 'Created on',
      shopName: 'Store name',
      city: 'City',
      region: 'Region / country',
      campaignContext: 'Campaign context',
      background: 'Background',
      reference: 'Reference',
      taskDeadline: 'Task deadline',
      campaignBriefingCount: (count: number) => `Briefing per campaign (${count})`,
      extraNotesDoc: 'Extra notes',
      generatedVia: 'Generated via LensOnline Campaign Catalog',
      print: 'Print / Save as PDF →',
      unknown: 'Unknown',
      noDetails: 'No extra details provided',
      noBlocksDoc: 'No briefing blocks for this campaign.',
      blocks: (count: number) => `${count} block${count !== 1 ? 's' : ''}`,
    },
    briefing: {
      title: 'Briefing',
      timing: 'Timing & description',
      deadline: 'Task deadline *',
      liveDate: 'Go-live date *',
      shortDescription: 'Describe in max. 4 words *',
      shortDescriptionPlaceholder: 'E.g. summer campaign sports glasses',
      backgroundInfo: 'More background information',
      backgroundPlaceholder: 'E.g. screen hangs behind the counter...',
      similarReference: 'Reference to a similar task',
      perCampaign: 'Briefing per campaign',
      generalReferences: 'General reference images',
      addBlock: 'Add block',
      noBlocks: 'No blocks yet. Add one below.',
      blockCount: (count: number) => `${count} block${count !== 1 ? 's' : ''}`,
      uploadTitle: 'Click to upload',
      uploadRest: ' or drag here',
      uploadHint: 'JPG, PNG — max. 10MB',
      from: 'From',
      until: 'Until',
      addFormat: '+ Add size',
      deleteBlock: 'Delete block',
      fields: {
        storefrontPhotos: 'Shopfront / window photos',
        window: 'Window',
        door: 'Door',
        notes: 'Notes',
        bannerSize: 'Size (cm)',
        material: 'Material',
        designWishes: 'What are your design wishes (or not)?',
        locationPhotos: 'Location photos',
        paper: 'Paper format',
        quantity: 'Quantity',
        orientation: 'Orientation',
        references: 'Reference images',
        platforms: 'Platforms',
        campaignPeriod: 'What is the campaign period?',
        websiteUrl: 'Website URL',
        subpage: 'Subpage',
        videoType: 'Video type',
        duration: 'Duration',
        screenOrientation: 'Screen orientation',
        specialFormats: 'Special formats',
        whereShown: 'Where will the video be shown',
        describeNeed: 'Describe what you need',
        examples: 'If you have examples or photos, add them to the task',
        extraInfo: 'Give more information',
      },
      placeholders: {
        stickerNotes: 'E.g. window is curved or the door frame is visible...',
        printQuantity: 'E.g. 500',
        bannerDesignWishes: 'E.g. clean and minimal, no busy backgrounds...',
        printDesignWishes: 'E.g. lots of white space, definitely no price explosions...',
        landingSubpage: '/summer-promo',
        specialFormats: 'If applicable',
        videoPlacement: 'E.g. shop window screen, waiting room, social ads...',
        otherNeed: 'First check whether the deliverable already exists in the selection menu.',
        otherExtraInfo: 'Extra context, placement, timing or points of attention...',
      },
    },
  },
} as const

const countryLabels = {
  VL: { nl: 'Vlaanderen', fr: 'Flandre', en: 'Flanders' },
  WA: { nl: 'Wallonië', fr: 'Wallonie', en: 'Wallonia' },
  NL: { nl: 'Nederland', fr: 'Pays-Bas', en: 'Netherlands' },
  LU: { nl: 'Luxemburg', fr: 'Luxembourg', en: 'Luxembourg' },
  FR: { nl: 'Frankrijk', fr: 'France', en: 'France' },
  DE: { nl: 'Duitsland', fr: 'Allemagne', en: 'Germany' },
} as const

const campaignTypeLabels: Record<string, Record<Lang, string>> = {
  CAMPAIGN: { nl: 'Campagne', fr: 'Campagne', en: 'Campaign' },
  'MEDIA KIT': { nl: 'Mediakit', fr: 'Kit média', en: 'Media kit' },
  MOCKUP: { nl: 'Mock-up', fr: 'Mock-up', en: 'Mockup' },
  'LANDING PAGE': { nl: 'Landingspagina', fr: "Page d'atterrissage", en: 'Landing page' },
  POS: { nl: 'POS', fr: 'POS', en: 'POS' },
} as const

const blockMetaLabels: Record<string, Record<Lang, { title: string; desc: string }>> = {
  'af-sticker': {
    nl: { title: 'Partnerbranding', desc: 'Etalageformaten, deurmaten en winkelbeelden' },
    fr: { title: 'Branding partenaire', desc: 'Formats vitrine, dimensions porte et images magasin' },
    en: { title: 'Partner branding', desc: 'Window sizes, door dimensions and shop visuals' },
  },
  'af-banner': {
    nl: { title: 'Banners, lightboxes & vlaggen', desc: 'Formaten, materiaal en designwensen' },
    fr: { title: 'Bannières, lightboxes & drapeaux', desc: 'Formats, matériau et souhaits design' },
    en: { title: 'Banners, lightboxes & flags', desc: 'Sizes, material and design wishes' },
  },
  'af-print': {
    nl: { title: 'Print & drukwerk', desc: 'Papier, oriëntatie en designwensen' },
    fr: { title: 'Impression & imprimés', desc: 'Papier, orientation et souhaits design' },
    en: { title: 'Print & printwork', desc: 'Paper, orientation and design wishes' },
  },
  'af-social': {
    nl: { title: 'Socialmediacampagne', desc: 'Platforms, campagneperiode en inspiratie' },
    fr: { title: 'Campagne réseaux sociaux', desc: 'Plateformes, période et inspiration' },
    en: { title: 'Social media campaign', desc: 'Platforms, campaign period and inspiration' },
  },
  'af-landing': {
    nl: { title: 'Landingspagina', desc: 'URL en gewenste subpagina' },
    fr: { title: "Page d'atterrissage", desc: 'URL et sous-page souhaitée' },
    en: { title: 'Landing page', desc: 'URL and desired subpage' },
  },
  'af-email': {
    nl: { title: 'E-mailcampagne', desc: 'Campagneperiode en extra context' },
    fr: { title: 'Campagne e-mail', desc: 'Période de campagne et contexte supplémentaire' },
    en: { title: 'Email campaign', desc: 'Campaign period and extra context' },
  },
  'af-video': {
    nl: { title: 'Video', desc: 'Oriëntatie, duur en weergavecontext' },
    fr: { title: 'Vidéo', desc: 'Orientation, durée et contexte de diffusion' },
    en: { title: 'Video', desc: 'Orientation, duration and display context' },
  },
  'af-other': {
    nl: { title: 'Anderen', desc: 'Overige deliverables en extra informatie' },
    fr: { title: 'Autres', desc: 'Autres livrables et informations supplémentaires' },
    en: { title: 'Other', desc: 'Other deliverables and extra information' },
  },
}

const briefingOptionLabels: Record<BriefingOptionKey, Record<string, Record<Lang, string>>> = {
  bannerMaterials: {
    pvc: { nl: 'Spandoek PVC', fr: 'Bâche PVC', en: 'PVC banner' },
    textile: { nl: 'Textiel banner', fr: 'Bannière textile', en: 'Textile banner' },
    flag: { nl: 'Vlag (wimpel)', fr: 'Drapeau', en: 'Flag' },
    lightbox: { nl: 'Lichtbak folie', fr: 'Film pour lightbox', en: 'Lightbox film' },
    undecided: { nl: 'Nog niet bepaald', fr: 'Pas encore déterminé', en: 'Not yet determined' },
  },
  printPaper: {
    a6: { nl: 'A6 (flyer)', fr: 'A6 (flyer)', en: 'A6 (flyer)' },
    a5: { nl: 'A5', fr: 'A5', en: 'A5' },
    a4: { nl: 'A4', fr: 'A4', en: 'A4' },
    a3: { nl: 'A3', fr: 'A3', en: 'A3' },
    a2: { nl: 'A2', fr: 'A2', en: 'A2' },
    a1: { nl: 'A1', fr: 'A1', en: 'A1' },
    custom: { nl: 'Aangepast formaat', fr: 'Format personnalisé', en: 'Custom format' },
  },
  orientation: {
    vertical: { nl: 'Verticaal', fr: 'Vertical', en: 'Vertical' },
    horizontal: { nl: 'Horizontaal', fr: 'Horizontal', en: 'Horizontal' },
  },
  socialPlatforms: {
    instagram: { nl: 'Instagram (post + story)', fr: 'Instagram (post + story)', en: 'Instagram (post + story)' },
    facebook: { nl: 'Facebook', fr: 'Facebook', en: 'Facebook' },
    linkedin: { nl: 'LinkedIn', fr: 'LinkedIn', en: 'LinkedIn' },
    tiktok: { nl: 'TikTok', fr: 'TikTok', en: 'TikTok' },
    gdn: { nl: 'Google Display Ads', fr: 'Google Display Ads', en: 'Google Display Ads' },
  },
  videoTypes: {
    campaign: { nl: 'Campagnevideo (winkel)', fr: 'Vidéo campagne (magasin)', en: 'Campaign video (store)' },
    lifestyle: { nl: 'Lifestyle / algemeen', fr: 'Lifestyle / général', en: 'Lifestyle / general' },
    product: { nl: 'Product showcase', fr: 'Présentation produit', en: 'Product showcase' },
    reel: { nl: 'Social media Reel', fr: 'Reel réseaux sociaux', en: 'Social media Reel' },
  },
  videoDurations: {
    s15: { nl: '15 seconden', fr: '15 secondes', en: '15 seconds' },
    s30: { nl: '30 seconden', fr: '30 secondes', en: '30 seconds' },
    s60: { nl: '60 seconden', fr: '60 secondes', en: '60 seconds' },
    m1plus: { nl: '+1 minuut', fr: '+1 minute', en: '+1 minute' },
  },
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('nl')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored && ['nl', 'fr', 'en'].includes(stored)) setLang(stored)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useI18n must be used within LanguageProvider')

  const { lang, setLang } = context

  return {
    lang,
    setLang,
    copy: translations[lang],
    formatDateLocale: lang === 'fr' ? 'fr-BE' : lang === 'en' ? 'en-BE' : 'nl-BE',
    translateCountry: (code: string) => countryLabels[code as keyof typeof countryLabels]?.[lang] || code,
    translateCampaignType: (type: string) => campaignTypeLabels[type]?.[lang] || type,
    translateBlockMeta: (typeId: string) => {
      const base = BLOCK_META[typeId]
      const localized = blockMetaLabels[typeId]?.[lang]
      if (!base || !localized) return base
      return { ...base, ...localized }
    },
    translateScope: (scope: string) => {
      if (scope === 'store') return translations[lang].steps.scope.store
      if (scope === 'online') return translations[lang].steps.scope.online
      if (scope === 'na') return translations[lang].steps.scope.na
      return scope
    },
    briefingOptions: Object.fromEntries(
      Object.entries(briefingOptionLabels).map(([key, values]) => [
        key,
        Object.entries(values).map(([value, labels]) => ({ value, label: labels[lang] })),
      ])
    ) as Record<BriefingOptionKey, { value: string; label: string }[]>,
    translateBriefingValue: (key: BriefingOptionKey, value: string) => {
      const labels = briefingOptionLabels[key]
      if (labels[value]) return labels[value][lang]

      const legacy = Object.values(labels).find(labelSet =>
        labelSet.nl === value || labelSet.fr === value || labelSet.en === value
      )
      return legacy ? legacy[lang] : value
    },
  }
}

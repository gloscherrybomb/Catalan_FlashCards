import type { GrammarLesson } from './grammarLessons';

/**
 * The grammar the course was missing between A2 and B1.
 *
 * The original 27 lessons stopped at the present subjunctive and never covered
 * the weak pronouns `en` and `hi`, their combinations, the imperative, the
 * imperfect subjunctive, the passive or reported speech. Those are not
 * refinements: `hi` and `en` are everyday A2 words with no English or Spanish
 * equivalent, and without the imperative a learner cannot say "come here".
 *
 * Sources for the rules, since no native speaker is reviewing this:
 *  - Weak pronouns, forms and functions: CPNL Gramàtica 37, and ésAdir's
 *    "Pronoms febles: formes i combinacions" for the combined forms.
 *  - Imperative paradigms: CPNL Gramàtica 19.
 *  - Imperfect subjunctive endings: verified against Softcatalà's conjugator
 *    for perdre (perdés/perdessis...) and dormir (dormís/dormissis...).
 *  - per / per a: the GIEC is deliberately polymorphic here, allowing three
 *    systems. The lesson teaches the Coromines-Solà usage - plain `per` before
 *    an infinitive - because that is what Catalan media and publishing follow.
 *
 * Every Catalan example in this file has been run through LanguageTool's ca-ES
 * rule set (scripts/checkAllCatalan.mjs).
 */
export const B1_GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'pronouns-en-hi',
    title: 'The Pronouns EN and HI',
    titleCatalan: 'Els pronoms EN i HI',
    category: 'pronouns',
    difficulty: 'intermediate',
    icon: 'connectors',
    estimatedMinutes: 18,
    content: {
      introduction:
        "EN and HI have no equivalent in English or Spanish, and they are everywhere in spoken Catalan. Skipping them is the single clearest sign of a foreign speaker. EN stands in for things introduced by DE and for quantities; HI stands in for places and for phrases introduced by any other preposition.",
      sections: [
        {
          title: 'EN: quantities and things introduced by DE',
          explanation:
            "Use EN when you would repeat an indefinite thing, an amount, or a phrase beginning with DE. English usually just drops the word; Catalan does not.",
          examples: [
            { catalan: 'Vols pa? Sí, en vull.', english: 'Do you want bread? Yes, I want some.', highlight: 'en' },
            { catalan: 'Quants anys tens? En tinc trenta.', english: 'How old are you? I am thirty.', highlight: 'En' },
            { catalan: 'Vens de Girona? Sí, en vinc.', english: 'Are you coming from Girona? Yes, I am.', highlight: 'en' },
            { catalan: 'Tinc tres germans i ella en té dos.', english: 'I have three brothers and she has two.', highlight: 'en' },
          ],
          tips: [
            'Answering a quantity almost always needs EN: "En tinc dos", never "Tinc dos" on its own.',
            "Before a vowel it elides to N': N'hi ha molts.",
            'After the verb it becomes -NE: Vull menjar-ne.',
          ],
        },
        {
          title: 'HI: places, and everything that is not DE',
          explanation:
            'HI replaces a place, or a phrase introduced by A, AMB, EN or PER. It never replaces a direct object, however often you hear that in speech.',
          examples: [
            { catalan: 'Vas a Barcelona? Sí, hi vaig demà.', english: 'Are you going to Barcelona? Yes, I am going tomorrow.', highlight: 'hi' },
            { catalan: 'Treballes a l’hospital? Sí, hi treballo.', english: 'Do you work at the hospital? Yes, I work there.', highlight: 'hi' },
            { catalan: 'Penses en les vacances? Sí, hi penso molt.', english: 'Are you thinking about the holidays? Yes, I think about them a lot.', highlight: 'hi' },
            { catalan: 'Afegeix-hi una mica de sal.', english: 'Add a little salt to it.', highlight: 'hi' },
          ],
          tips: [
            'HI VA with a place, EN VE from a place: hi vaig / en vinc.',
            'HI never replaces a direct object. "El veig", not "Hi veig".',
            'Fixed expressions use HI: no hi fa res, hi ha, s’hi val.',
          ],
        },
        {
          title: 'HI HA: there is, there are',
          explanation:
            'The commonest use of all. Catalan says HI HA for both singular and plural, and the verb never agrees with what follows.',
          examples: [
            { catalan: 'Hi ha una farmàcia a la plaça.', english: 'There is a pharmacy in the square.', highlight: 'Hi ha' },
            { catalan: 'Hi ha molts turistes al carrer.', english: 'There are a lot of tourists in the street.', highlight: 'Hi ha' },
            { catalan: 'Ahir hi havia molta gent.', english: 'There were a lot of people yesterday.', highlight: 'hi havia' },
            { catalan: 'No n’hi ha cap.', english: 'There are none.', highlight: 'n’hi ha' },
          ],
          tips: [
            'Never "hi han": the plural form is wrong in standard Catalan.',
            'Past: hi havia. Future: hi haurà. Perfect: hi ha hagut.',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'enhi-1',
        type: 'fill-blank',
        question: 'Vols cafè? Sí, ___ vull. (Do you want coffee? Yes, I want some.)',
        correctAnswer: 'en',
        explanation: 'An indefinite quantity of something takes EN.',
      },
      {
        id: 'enhi-2',
        type: 'fill-blank',
        question: 'Vas al mercat? Sí, ___ vaig. (Are you going to the market? Yes, I am going.)',
        correctAnswer: 'hi',
        explanation: 'A place introduced by A is replaced by HI.',
      },
      {
        id: 'enhi-3',
        type: 'multiple-choice',
        question: 'How do you say "There are three books"?',
        options: ['Hi ha tres llibres', 'Hi han tres llibres', 'Hi és tres llibres', 'Ha tres llibres'],
        correctAnswer: 'Hi ha tres llibres',
        explanation: 'HI HA never becomes plural, however many things follow it.',
      },
      {
        id: 'enhi-4',
        type: 'multiple-choice',
        question: 'Quants germans tens? Complete: "___ tinc dos."',
        options: ['En', 'Hi', 'Ho', 'Els'],
        correctAnswer: 'En',
        explanation: 'Answering with a number needs EN in Catalan, unlike English.',
      },
      {
        id: 'enhi-5',
        type: 'translate',
        question: 'Translate: "Yes, I work there."',
        targetLanguage: 'catalan',
        hints: ['hi', 'treballar'],
        correctAnswer: 'Sí, hi treballo',
        explanation: 'The place is already known, so HI stands in for it.',
      },
    ],
    relatedCategories: ['pronouns'],
  },

  {
    id: 'neuter-pronoun-ho',
    title: 'The Neuter Pronoun HO',
    titleCatalan: 'El pronom neutre HO',
    category: 'pronouns',
    difficulty: 'intermediate',
    icon: 'attitudes',
    estimatedMinutes: 12,
    content: {
      introduction:
        'HO stands for a whole idea rather than a specific noun: a fact, a clause, or something with no gender. Where English says "it" about a situation, Catalan says HO.',
      sections: [
        {
          title: 'HO for a whole idea',
          explanation: 'When what you are replacing is a clause or a fact, not a noun, use HO.',
          examples: [
            { catalan: 'Saps que arriba demà? No, no ho sabia.', english: 'Do you know he arrives tomorrow? No, I did not know.', highlight: 'ho' },
            { catalan: 'Ho entenc perfectament.', english: 'I understand it perfectly.', highlight: 'Ho' },
            { catalan: 'Digues-m’ho, si us plau.', english: 'Tell me, please.', highlight: 'ho' },
          ],
          tips: [
            'HO never changes form and never elides.',
            'Use EL or LA for a definite noun, HO for an idea: "El veig" (I see him) vs "Ho veig" (I see, I get it).',
          ],
        },
        {
          title: 'HO with ser and estar',
          explanation:
            'Catalan repeats the adjective as HO where English simply says "I am". This sounds odd at first and is completely standard.',
          examples: [
            { catalan: 'Estàs cansat? Sí, ho estic.', english: 'Are you tired? Yes, I am.', highlight: 'ho' },
            { catalan: 'És metgessa? Sí que ho és.', english: 'Is she a doctor? Yes, she is.', highlight: 'ho' },
            { catalan: 'Sembla difícil, però no ho és.', english: 'It seems difficult, but it is not.', highlight: 'ho' },
          ],
          tips: ['A bare "Sí, estic" is wrong; the pronoun is required.'],
        },
      ],
    },
    exercises: [
      {
        id: 'ho-1',
        type: 'fill-blank',
        question: 'Estàs content? Sí, ___ estic.',
        correctAnswer: 'ho',
        explanation: 'An adjective after ser or estar is taken up by HO.',
      },
      {
        id: 'ho-2',
        type: 'multiple-choice',
        question: 'Which sentence means "I already know (that)"?',
        options: ['Ja ho sé', 'Ja el sé', 'Ja hi sé', 'Ja en sé'],
        correctAnswer: 'Ja ho sé',
        explanation: 'What is known is a fact, not a noun, so it takes HO.',
      },
      {
        id: 'ho-3',
        type: 'translate',
        question: 'Translate: "I do not understand it."',
        targetLanguage: 'catalan',
        hints: ['ho', 'entendre'],
        correctAnswer: 'No ho entenc',
        explanation: 'The thing not understood is an idea, so HO.',
      },
    ],
    relatedCategories: ['pronouns'],
  },

  {
    id: 'combining-weak-pronouns',
    title: 'Combining Weak Pronouns',
    titleCatalan: 'Combinacions de pronoms febles',
    category: 'pronouns',
    difficulty: 'advanced',
    icon: 'problems',
    estimatedMinutes: 20,
    content: {
      introduction:
        'Two pronouns in one sentence is where Catalan gets its reputation. The order is fixed: the indirect object comes first, then the direct. Learn the handful of everyday combinations and the rest follow.',
      sections: [
        {
          title: 'The order',
          explanation:
            'Indirect before direct, always. "He gives me it" is EM + EL, in that order.',
          examples: [
            { catalan: 'Me’l dona demà.', english: 'He gives it to me tomorrow.', highlight: 'Me’l' },
            { catalan: 'Te la porto aquesta tarda.', english: 'I will bring it to you this afternoon.', highlight: 'Te la' },
            { catalan: 'Ens els ha venut barats.', english: 'He sold them to us cheaply.', highlight: 'Ens els' },
          ],
          tips: [
            'EM and ET become ME and TE when another pronoun follows: me’l, te la.',
            'The order never changes, whatever the verb.',
          ],
        },
        {
          title: 'The forms with LI: l’hi and n’hi',
          explanation:
            'LI plus a direct object does not stay as LI. It becomes L’HI, and LI plus EN becomes N’HI. These are the two you will hear most.',
          examples: [
            { catalan: 'L’hi vaig donar ahir.', english: 'I gave it to him yesterday.', highlight: 'L’hi' },
            { catalan: 'L’hi has dit?', english: 'Have you told her?', highlight: 'L’hi' },
            { catalan: 'N’hi va donar tres.', english: 'He gave him three of them.', highlight: 'N’hi' },
          ],
          tips: [
            "L'HI covers both li + el and li + ho.",
            "N'HI is li + en.",
            'For a plural person, ELS HI: els hi vaig dir que sí.',
          ],
        },
        {
          title: 'Attached to an infinitive or imperative',
          explanation:
            'After the verb the pronouns hyphenate, and the same order holds. This is where the apostrophes appear.',
          examples: [
            { catalan: 'Vull donar-te’l.', english: 'I want to give it to you.', highlight: 'donar-te’l' },
            { catalan: 'Porta-me’l, sisplau.', english: 'Bring it to me, please.', highlight: 'Porta-me’l' },
            { catalan: 'Digues-l’hi ara.', english: 'Tell him now.', highlight: 'Digues-l’hi' },
          ],
          tips: [
            'With a periphrasis you may put them before instead: te’l vull donar = vull donar-te’l.',
            'HO and HI never take an apostrophe: porta-ho, pensa-hi.',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'combo-1',
        type: 'multiple-choice',
        question: 'Which is "I gave it to him"?',
        options: ['L’hi vaig donar', 'Li el vaig donar', 'Hi el vaig donar', 'El li vaig donar'],
        correctAnswer: 'L’hi vaig donar',
        explanation: 'LI plus a direct object contracts to L’HI; "li el" is never written.',
      },
      {
        id: 'combo-2',
        type: 'fill-blank',
        question: 'Complete "Bring it to me": Porta-___, sisplau.',
        correctAnswer: 'me’l',
        explanation: 'Indirect first (me), then direct (el), joined after the imperative.',
      },
      {
        id: 'combo-3',
        type: 'multiple-choice',
        question: 'Which order is correct?',
        options: ['Indirect object, then direct object', 'Direct object, then indirect object', 'Whichever sounds better', 'Alphabetical'],
        correctAnswer: 'Indirect object, then direct object',
        explanation: 'The order is fixed in Catalan, unlike the flexible English "give me it / give it to me".',
      },
    ],
    relatedCategories: ['pronouns'],
  },

  {
    id: 'imperative',
    title: 'The Imperative',
    titleCatalan: "L'imperatiu",
    category: 'verbs',
    difficulty: 'intermediate',
    icon: 'imperative',
    estimatedMinutes: 15,
    content: {
      introduction:
        'Giving instructions, offering, insisting, asking someone in. Catalan builds the affirmative imperative from the present indicative, and the negative one from the subjunctive — the two are not the same forms.',
      sections: [
        {
          title: 'Telling one person (tu)',
          explanation:
            'For TU, the form is the same as the third person singular of the present indicative.',
          examples: [
            { catalan: 'Parla més a poc a poc.', english: 'Speak more slowly.', highlight: 'Parla' },
            { catalan: 'Menja, que es refredarà.', english: 'Eat, it will get cold.', highlight: 'Menja' },
            { catalan: 'Obre la finestra, sisplau.', english: 'Open the window, please.', highlight: 'Obre' },
          ],
          tips: ['parlar → parla, menjar → menja, obrir → obre, llegir → llegeix.'],
        },
        {
          title: 'The irregular ones you need',
          explanation: 'A short list, and they are the verbs you use most.',
          examples: [
            { catalan: 'Vine aquí un moment.', english: 'Come here a moment.', highlight: 'Vine' },
            { catalan: 'Digues-me què ha passat.', english: 'Tell me what happened.', highlight: 'Digues' },
            { catalan: 'Fes-ho ara, sisplau.', english: 'Do it now, please.', highlight: 'Fes' },
            { catalan: 'Estigues tranquil, no passa res.', english: 'Stay calm, it is nothing.', highlight: 'Estigues' },
          ],
          tips: [
            'anar → ves, venir → vine, fer → fes, dir → digues',
            'ser → sigues, estar → estigues, tenir → tingues, saber → sàpigues',
          ],
        },
        {
          title: 'Being polite, and saying no',
          explanation:
            'For VOSTÈ the imperative borrows the subjunctive. So does every negative command, for all persons.',
          examples: [
            { catalan: 'Passi, segui, sisplau.', english: 'Come in, sit down, please.', highlight: 'Passi' },
            { catalan: 'No parlis tan de pressa.', english: 'Do not speak so fast.', highlight: 'No parlis' },
            { catalan: 'No hi vagis avui.', english: 'Do not go there today.', highlight: 'No hi vagis' },
          ],
          tips: [
            'Affirmative to TU: parla. Negative to TU: no parlis.',
            'VOSTÈ takes the subjunctive either way: passi / no passi.',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'imp-1',
        type: 'multiple-choice',
        question: 'How do you tell a friend "Come here"?',
        options: ['Vine aquí', 'Vens aquí', 'Vindràs aquí', 'Venir aquí'],
        correctAnswer: 'Vine aquí',
        explanation: 'VENIR has the irregular imperative VINE for TU.',
      },
      {
        id: 'imp-2',
        type: 'fill-blank',
        question: 'Negative command to a friend: No ___ tan de pressa. (parlar)',
        correctAnswer: 'parlis',
        explanation: 'Negative commands use the present subjunctive, so parla becomes no parlis.',
      },
      {
        id: 'imp-3',
        type: 'multiple-choice',
        question: 'Which is the polite (vostè) form of "sit down"?',
        options: ['Segui', 'Seu', 'Seus', 'Sèieu'],
        correctAnswer: 'Segui',
        explanation: 'VOSTÈ takes the subjunctive form.',
      },
    ],
    relatedCategories: ['verbs'],
  },

  {
    id: 'comparatives',
    title: 'Comparatives and Superlatives',
    titleCatalan: 'Comparatius i superlatius',
    category: 'adjectives',
    difficulty: 'beginner',
    icon: 'comparison',
    estimatedMinutes: 12,
    content: {
      introduction:
        'Bigger, less expensive, the best in town. Catalan builds comparisons with MÉS and MENYS, and marks the second half with QUE.',
      sections: [
        {
          title: 'More, less, as much as',
          explanation: 'MÉS ... QUE, MENYS ... QUE, and TAN ... COM for equality.',
          examples: [
            { catalan: 'Girona és més petita que Barcelona.', english: 'Girona is smaller than Barcelona.', highlight: 'més' },
            { catalan: 'Aquest pis és menys car que l’altre.', english: 'This flat is less expensive than the other one.', highlight: 'menys' },
            { catalan: 'És tan alt com el seu germà.', english: 'He is as tall as his brother.', highlight: 'tan' },
            { catalan: 'Menja tant com jo.', english: 'He eats as much as I do.', highlight: 'tant' },
          ],
          tips: [
            'TAN before an adjective or adverb; TANT before a verb or a noun.',
            'The second half is QUE with més and menys, but COM with tan.',
          ],
        },
        {
          title: 'The best and the worst',
          explanation:
            'The superlative is the comparative with an article. Four common adjectives have their own forms.',
          examples: [
            { catalan: 'És el restaurant més bo del barri.', english: 'It is the best restaurant in the neighbourhood.', highlight: 'més bo' },
            { catalan: 'Aquesta és la millor opció.', english: 'This is the best option.', highlight: 'millor' },
            { catalan: 'Ha estat el pitjor dia de l’any.', english: 'It has been the worst day of the year.', highlight: 'pitjor' },
            { catalan: 'El meu germà gran viu a Figueres.', english: 'My older brother lives in Figueres.', highlight: 'gran' },
          ],
          tips: [
            'bo → millor, dolent → pitjor, gran → major, petit → menor.',
            'After a superlative, "in" is DE: el més alt de la classe.',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'comp-1',
        type: 'fill-blank',
        question: 'Barcelona és ___ gran que Girona.',
        correctAnswer: 'més',
        explanation: 'MÉS ... QUE is the ordinary comparison of superiority.',
      },
      {
        id: 'comp-2',
        type: 'multiple-choice',
        question: 'Which means "the best option"?',
        options: ['la millor opció', 'la més bona opció que', 'la opció millor de', 'la pitjor opció'],
        correctAnswer: 'la millor opció',
        explanation: 'BO has the irregular comparative MILLOR.',
      },
      {
        id: 'comp-3',
        type: 'multiple-choice',
        question: 'Complete: "És ___ alt com el seu pare."',
        options: ['tan', 'tant', 'més', 'menys'],
        correctAnswer: 'tan',
        explanation: 'TAN goes before an adjective; TANT before verbs and nouns.',
      },
    ],
    relatedCategories: ['adjectives'],
  },

  {
    id: 'imperfect-subjunctive',
    title: 'The Imperfect Subjunctive',
    titleCatalan: "L'imperfet de subjuntiu",
    category: 'tenses',
    difficulty: 'advanced',
    icon: 'subjunctive',
    estimatedMinutes: 18,
    content: {
      introduction:
        'The tense for things that are not so: unreal conditions, wishes about the past, and any subjunctive whose main clause is already in the past or conditional.',
      sections: [
        {
          title: 'The endings',
          explanation:
            '-AR and -ER/-RE verbs share one set; -IR verbs take the other. Only the vowel changes.',
          examples: [
            { catalan: 'Si cantés millor, aniria al cor.', english: 'If I sang better, I would join the choir.', highlight: 'cantés' },
            { catalan: 'Volia que perdessis la por.', english: 'I wanted you to lose your fear.', highlight: 'perdessis' },
            { catalan: 'No creia que dormissin tant.', english: 'I did not think they slept so much.', highlight: 'dormissin' },
          ],
          table: {
            verb: 'cantar',
            verbEnglish: 'to sing',
            tense: 'Imperfet de subjuntiu',
            conjugations: [
              { pronoun: 'jo', form: 'cantés' },
              { pronoun: 'tu', form: 'cantessis' },
              { pronoun: 'ell/ella', form: 'cantés' },
              { pronoun: 'nosaltres', form: 'cantéssim' },
              { pronoun: 'vosaltres', form: 'cantéssiu' },
              { pronoun: 'ells/elles', form: 'cantessin' },
            ],
          },
          tips: [
            '-ar and -er/-re: -és, -essis, -és, -éssim, -éssiu, -essin (perdre → perdés).',
            '-ir: -ís, -issis, -ís, -íssim, -íssiu, -issin (dormir → dormís).',
          ],
        },
        {
          title: 'Unreal conditions',
          explanation:
            'SI plus the imperfect subjunctive, and the conditional in the other half. Never the conditional after SI.',
          examples: [
            { catalan: 'Si tingués temps, vindria amb tu.', english: 'If I had time, I would come with you.', highlight: 'tingués' },
            { catalan: 'Si fes bo, aniríem a la platja.', english: 'If the weather were good, we would go to the beach.', highlight: 'fes' },
            { catalan: 'Si ho sabés, t’ho diria.', english: 'If I knew, I would tell you.', highlight: 'sabés' },
          ],
          tips: [
            'Si + imperfet de subjuntiu → condicional. "Si tindria" is a common and serious mistake.',
            'ser → fos, tenir → tingués, fer → fes, saber → sabés, poder → pogués, anar → anés.',
          ],
        },
        {
          title: 'After a past main clause',
          explanation:
            'When the main verb is in the past or the conditional, a subjunctive that follows moves back with it.',
          examples: [
            { catalan: 'Em va demanar que l’ajudés.', english: 'He asked me to help him.', highlight: 'ajudés' },
            { catalan: 'No hi havia ningú que ho sabés.', english: 'There was nobody who knew.', highlight: 'sabés' },
            { catalan: 'M’agradaria que vinguessis.', english: 'I would like you to come.', highlight: 'vinguessis' },
          ],
          tips: ['Present main clause → present subjunctive. Past or conditional → imperfect subjunctive.'],
        },
      ],
    },
    exercises: [
      {
        id: 'impsubj-1',
        type: 'fill-blank',
        question: 'Si ___ temps, vindria amb tu. (tenir)',
        correctAnswer: 'tingués',
        explanation: 'An unreal condition after SI takes the imperfect subjunctive.',
      },
      {
        id: 'impsubj-2',
        type: 'multiple-choice',
        question: 'Which is correct?',
        options: ['Si ho sabés, t’ho diria', 'Si ho sabria, t’ho diria', 'Si ho sé, t’ho diria', 'Si ho sabria, t’ho sabria'],
        correctAnswer: 'Si ho sabés, t’ho diria',
        explanation: 'The conditional never follows SI; the imperfect subjunctive does.',
      },
      {
        id: 'impsubj-3',
        type: 'fill-blank',
        question: 'Em va demanar que l’___. (ajudar)',
        correctAnswer: 'ajudés',
        explanation: 'The main verb is in the past, so the subjunctive is the imperfect.',
      },
    ],
    relatedCategories: ['tenses', 'verbs'],
  },

  {
    id: 'per-vs-per-a',
    title: 'PER and PER A',
    titleCatalan: 'PER i PER A',
    category: 'prepositions',
    difficulty: 'intermediate',
    icon: 'target',
    estimatedMinutes: 12,
    content: {
      introduction:
        "Roughly, PER is the reason and PER A is the destination. The IEC's grammar deliberately allows more than one system before an infinitive; this lesson follows the usage of Catalan media and publishing, which is the plain PER.",
      sections: [
        {
          title: 'PER: cause, agent, exchange, route',
          explanation: 'Why something happened, who did it, what it cost, which way you went.',
          examples: [
            { catalan: 'Ho vaig fer per tu.', english: 'I did it because of you.', highlight: 'per' },
            { catalan: 'Gràcies per la teva ajuda.', english: 'Thank you for your help.', highlight: 'per' },
            { catalan: 'Ho he comprat per deu euros.', english: 'I bought it for ten euros.', highlight: 'per' },
            { catalan: 'Passegem per la Rambla.', english: 'We are walking along the Rambla.', highlight: 'per' },
          ],
          tips: ['Cause, price, route, agent of a passive: all PER.'],
        },
        {
          title: 'PER A: who or what it is meant for',
          explanation: 'Before a noun or a pronoun, PER A marks the recipient or the intended purpose.',
          examples: [
            { catalan: 'Aquest regal és per a tu.', english: 'This present is for you.', highlight: 'per a' },
            { catalan: 'És un llibre per a nens.', english: 'It is a book for children.', highlight: 'per a' },
            { catalan: 'Tinc una sorpresa per a la Marta.', english: 'I have a surprise for Marta.', highlight: 'per a' },
          ],
          tips: ['If you can say "intended for", it is PER A.'],
        },
        {
          title: 'Before an infinitive: use PER',
          explanation:
            'To express purpose before a verb, standard usage in Catalonia is plain PER. The grammar permits PER A here too, but PER is what you will read and hear.',
          examples: [
            { catalan: 'Estudio per aprovar l’examen.', english: 'I study in order to pass the exam.', highlight: 'per' },
            { catalan: 'Hem vingut per veure’t.', english: 'We came to see you.', highlight: 'per' },
            { catalan: 'Necessito temps per pensar.', english: 'I need time to think.', highlight: 'per' },
          ],
          tips: [
            'Purpose before a verb: per + infinitive.',
            'Recipient before a noun: per a + noun.',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'pera-1',
        type: 'fill-blank',
        question: 'Aquest regal és ___ tu. (for you)',
        correctAnswer: 'per a',
        explanation: 'A recipient before a pronoun takes PER A.',
      },
      {
        id: 'pera-2',
        type: 'multiple-choice',
        question: 'Which is standard for "I study to pass the exam"?',
        options: ['Estudio per aprovar l’examen', 'Estudio per a aprovar l’examen', 'Estudio per què aprovar', 'Estudio a aprovar'],
        correctAnswer: 'Estudio per aprovar l’examen',
        explanation: 'Before an infinitive of purpose, standard usage in Catalonia is plain PER.',
      },
      {
        id: 'pera-3',
        type: 'multiple-choice',
        question: 'Complete: "Gràcies ___ la teva ajuda."',
        options: ['per', 'per a', 'a', 'de'],
        correctAnswer: 'per',
        explanation: 'Cause and motive take PER.',
      },
    ],
    relatedCategories: ['prepositions'],
  },

  {
    id: 'passive-voice',
    title: 'The Passive, and How Catalan Avoids It',
    titleCatalan: 'La passiva i com evitar-la',
    category: 'structure',
    difficulty: 'advanced',
    icon: 'passive',
    estimatedMinutes: 15,
    content: {
      introduction:
        'Catalan has a passive with SER, but uses it far less than English. Most of the time a Catalan speaker reaches for the pronominal ES instead, and knowing that is what stops your Catalan sounding translated.',
      sections: [
        {
          title: 'The passive with SER',
          explanation:
            'SER plus a participle, which agrees with the subject. The agent, if named, takes PER.',
          examples: [
            { catalan: 'La catedral va ser construïda al segle XIV.', english: 'The cathedral was built in the fourteenth century.', highlight: 'va ser construïda' },
            { catalan: 'El llibre va ser escrit per una gironina.', english: 'The book was written by a woman from Girona.', highlight: 'per' },
            { catalan: 'Els carrers són netejats cada nit.', english: 'The streets are cleaned every night.', highlight: 'són netejats' },
          ],
          tips: [
            'The participle agrees: construïda, escrit, netejats.',
            'Reserve it for formal or written registers.',
          ],
        },
        {
          title: 'The passive with ES, which is what people say',
          explanation:
            'Far commoner. ES plus the verb in the third person, agreeing with the thing affected. English often translates it with a passive or with "you".',
          examples: [
            { catalan: 'Aquí es parla català.', english: 'Catalan is spoken here.', highlight: 'es parla' },
            { catalan: 'Es venen pisos al centre.', english: 'Flats are for sale in the centre.', highlight: 'Es venen' },
            { catalan: 'Com es diu això en català?', english: 'How do you say this in Catalan?', highlight: 'es diu' },
          ],
          tips: [
            'The verb agrees with the thing: es ven un pis, es venen pisos.',
            'This is the natural choice when the agent does not matter.',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'pass-1',
        type: 'multiple-choice',
        question: 'Which is the natural way to say "Catalan is spoken here"?',
        options: ['Aquí es parla català', 'Aquí és parlat català', 'Aquí està parlat català', 'Aquí parla català'],
        correctAnswer: 'Aquí es parla català',
        explanation: 'Everyday Catalan prefers the pronominal passive with ES.',
      },
      {
        id: 'pass-2',
        type: 'fill-blank',
        question: 'Plural agreement: "Es ___ pisos al centre." (vendre)',
        correctAnswer: 'venen',
        explanation: 'The verb agrees with "pisos", so it is plural.',
      },
      {
        id: 'pass-3',
        type: 'multiple-choice',
        question: 'In a passive with SER, the agent is introduced by:',
        options: ['per', 'de', 'amb', 'a'],
        correctAnswer: 'per',
        explanation: 'Escrit per una gironina.',
      },
    ],
    relatedCategories: ['structure', 'verbs'],
  },

  {
    id: 'reported-speech',
    title: 'Reported Speech',
    titleCatalan: 'L’estil indirecte',
    category: 'structure',
    difficulty: 'advanced',
    icon: 'idioms',
    estimatedMinutes: 15,
    content: {
      introduction:
        'Passing on what somebody said. The tense moves back, the people change, and questions lose their word order.',
      sections: [
        {
          title: 'Statements',
          explanation: 'Introduce with QUE, which cannot be dropped the way English drops "that".',
          examples: [
            { catalan: 'Diu que arriba demà.', english: 'He says he is arriving tomorrow.', highlight: 'que' },
            { catalan: 'Va dir que arribava l’endemà.', english: 'He said he was arriving the next day.', highlight: 'que arribava' },
            { catalan: 'M’ha explicat que ha trobat feina.', english: 'She has told me she has found a job.', highlight: 'que' },
          ],
          tips: [
            'QUE is obligatory.',
            'Present → imperfet, perfet → plusquamperfet, futur → condicional.',
            'demà becomes l’endemà, avui becomes aquell dia.',
          ],
        },
        {
          title: 'Questions',
          explanation:
            'A yes-or-no question becomes SI. A question word stays, but the sentence goes back to statement order.',
          examples: [
            { catalan: 'Em va preguntar si volia cafè.', english: 'He asked me whether I wanted coffee.', highlight: 'si' },
            { catalan: 'Vol saber on vius.', english: 'She wants to know where you live.', highlight: 'on' },
            { catalan: 'Em va preguntar què feia.', english: 'He asked me what I was doing.', highlight: 'què' },
          ],
          tips: ['No question mark on a reported question.'],
        },
        {
          title: 'Orders',
          explanation: 'A command becomes QUE plus the subjunctive.',
          examples: [
            { catalan: 'Em va dir que vingués aviat.', english: 'He told me to come early.', highlight: 'que vingués' },
            { catalan: 'Ens demana que esperem aquí.', english: 'He is asking us to wait here.', highlight: 'que esperem' },
          ],
          tips: ['Past main verb → imperfect subjunctive: que vingués.'],
        },
      ],
    },
    exercises: [
      {
        id: 'rep-1',
        type: 'fill-blank',
        question: 'Direct: "Vinc demà." Reported: Va dir ___ venia l’endemà.',
        correctAnswer: 'que',
        explanation: 'QUE cannot be left out in Catalan.',
      },
      {
        id: 'rep-2',
        type: 'multiple-choice',
        question: 'Report the question "Vols cafè?"',
        options: ['Em va preguntar si volia cafè', 'Em va preguntar que volia cafè', 'Em va preguntar vols cafè', 'Em va preguntar què volia cafè'],
        correctAnswer: 'Em va preguntar si volia cafè',
        explanation: 'A yes-or-no question is reported with SI.',
      },
      {
        id: 'rep-3',
        type: 'fill-blank',
        question: 'Report the order "Vine aviat": Em va dir que ___ aviat. (venir)',
        correctAnswer: 'vingués',
        explanation: 'A reported order takes the subjunctive, imperfect after a past main verb.',
      },
    ],
    relatedCategories: ['structure', 'tenses'],
  },

  {
    id: 'adverbs-ment',
    title: 'Adverbs in -MENT',
    titleCatalan: 'Els adverbis en -MENT',
    category: 'basics',
    difficulty: 'beginner',
    icon: 'adverb',
    estimatedMinutes: 10,
    content: {
      introduction:
        'Catalan turns adjectives into adverbs with -MENT, from the feminine form. There is one detail worth getting right, and one habit worth picking up.',
      sections: [
        {
          title: 'Building them',
          explanation:
            'Take the feminine singular of the adjective and add -MENT. An adjective with no separate feminine simply takes the ending.',
          examples: [
            { catalan: 'Parla lentament, sisplau.', english: 'Speak slowly, please.', highlight: 'lentament' },
            { catalan: 'Ho ha fet perfectament.', english: 'He did it perfectly.', highlight: 'perfectament' },
            { catalan: 'Evidentment, tens raó.', english: 'Obviously, you are right.', highlight: 'Evidentment' },
          ],
          tips: [
            'lenta → lentament, ràpida → ràpidament, perfecta → perfectament.',
            'The adjective keeps its own accent: ràpida → ràpidament.',
          ],
        },
        {
          title: 'Two in a row, and what to use instead',
          explanation:
            'Spanish drops the ending from the first of two coordinated adverbs. Catalan does not: keep -MENT on both. Dropping it is only possible on the LAST one, and reads as markedly formal. A long -MENT adverb also often sounds better as a phrase.',
          examples: [
            { catalan: 'Ho va fer lentament i acuradament.', english: 'He did it slowly and carefully.', highlight: 'lentament i acuradament' },
            { catalan: 'Parla a poc a poc.', english: 'He speaks slowly.', highlight: 'a poc a poc' },
            { catalan: 'Ho va fer de pressa.', english: 'He did it quickly.', highlight: 'de pressa' },
          ],
          tips: [
            'Keep -MENT on both. Dropping it from the FIRST is the Spanish pattern, not the Catalan one.',
            'If one is dropped it is the last, and that is markedly formal: tranquil·lament i serena.',
            'Everyday Catalan often prefers a poc a poc, de pressa, de sobte to the -MENT form.',
          ],
        },
      ],
    },
    exercises: [
      {
        id: 'advm-1',
        type: 'fill-blank',
        question: 'Make an adverb from "ràpida": Corre ___.',
        correctAnswer: 'ràpidament',
        explanation: 'The feminine adjective plus -MENT, keeping the original accent.',
      },
      {
        id: 'advm-2',
        type: 'multiple-choice',
        question: 'Which is correct for "slowly and carefully"?',
        options: ['lentament i acuradament', 'lenta i acuradament', 'lent i acurat', 'lenta i acurada'],
        correctAnswer: 'lentament i acuradament',
        explanation: 'Catalan keeps -MENT on both. Dropping it from the first is the Spanish pattern.',
      },
      {
        id: 'advm-3',
        type: 'multiple-choice',
        question: 'A common everyday way to say "slowly" is:',
        options: ['a poc a poc', 'de sobte', 'de pressa', 'aviat'],
        correctAnswer: 'a poc a poc',
        explanation: 'Catalan often prefers a phrase to a long -MENT adverb.',
      },
    ],
    relatedCategories: ['basics', 'adjectives'],
  },
];

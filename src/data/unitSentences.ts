import type { SentenceData } from './exampleSentences';
import { tokenise } from '../utils/textUtils';

/**
 * Example sentences for the twenty course units.
 *
 * Only 53 sentences existed for 455 vocabulary words, so 86% of the vocabulary
 * reached the "learn in context" step with nothing to show and the example
 * panel silently rendered nothing. These sentences cover the core of each unit.
 *
 * Register is standard Central (Barcelona) Catalan, matching the course. Each
 * sentence is written to use its target word the way a learner would actually
 * meet it, rather than as a slot in a template.
 *
 * NOTE FOR REVIEW: this content was drafted by Claude. It follows standard
 * orthography (IEC) and has been checked for agreement and contractions, but a
 * native speaker should still read it before you rely on it for teaching.
 */

/** A sentence as authored: target words by name, not by index. */
interface AuthoredSentence {
  id: string;
  categoryId: string;
  catalan: string;
  english: string;
  /** Vocabulary this sentence exists to demonstrate. */
  targetWords: string[];
  grammarConcepts?: string[];
}

/**
 * Resolve target words to their positions in the sentence.
 *
 * vocabularyIndices drives which word Fill-in-the-Blank hides and how Sentence
 * Builder scores, so deriving it from the words themselves keeps it correct;
 * hand-counting indices across two hundred sentences would not stay correct for
 * long.
 *
 * Crucially these are indices into a WHITESPACE split, because that is what
 * sentenceService.tokenizeSentence produces and what the exercises index into.
 * Using the linguistic tokeniser here instead would misalign every sentence
 * containing an elision: `d'aigua` is one whitespace token but two linguistic
 * ones, so every index after it would be off by one and the exercise would
 * blank the wrong word.
 */
function withIndices(authored: AuthoredSentence): SentenceData {
  const words = authored.catalan.split(/\s+/).filter(Boolean);

  const indices = authored.targetWords.flatMap((target) => {
    const targetTokens = tokenise(target);
    if (targetTokens.length === 0) return [];

    for (let i = 0; i < words.length; i++) {
      // Allow a target to span consecutive whitespace tokens (a phrase), and to
      // sit inside one of them (`aigua` within `d'aigua`).
      for (let span = 1; span <= words.length - i; span++) {
        const windowTokens = tokenise(words.slice(i, i + span).join(' '));
        if (windowTokens.length < targetTokens.length) continue;

        const found = windowTokens.some((_, offset) =>
          targetTokens.every((t, k) => windowTokens[offset + k] === t)
        );
        if (found) return [i];

        // No point widening further once the window overshoots.
        if (windowTokens.length > targetTokens.length + 1) break;
      }
    }
    return [];
  });

  return {
    id: authored.id,
    categoryId: authored.categoryId,
    catalan: authored.catalan,
    english: authored.english,
    vocabularyIndices: [...new Set(indices)].sort((a, b) => a - b),
    hasAudio: true,
    grammarConcepts: authored.grammarConcepts,
    targetWords: authored.targetWords,
  };
}

const AUTHORED: AuthoredSentence[] = [
  // ---------------------------------------------------------------- Unit 1
  { id: 'u1-1', categoryId: 'greetings', catalan: 'Hola! Què tal?', english: 'Hello! How are things?', targetWords: ['hola'] },
  { id: 'u1-2', categoryId: 'greetings', catalan: 'Bon dia, senyora Puig.', english: 'Good morning, Mrs Puig.', targetWords: ['bon dia'] },
  { id: 'u1-3', categoryId: 'greetings', catalan: 'Bona tarda, passi endavant.', english: 'Good afternoon, do come in.', targetWords: ['bona tarda'] },
  { id: 'u1-4', categoryId: 'greetings', catalan: 'Bona nit, que descansis.', english: 'Good night, sleep well.', targetWords: ['bona nit'] },
  { id: 'u1-5', categoryId: 'greetings', catalan: 'Adéu, ens veiem aviat.', english: 'Goodbye, see you soon.', targetWords: ['adéu'] },
  { id: 'u1-6', categoryId: 'greetings', catalan: 'Ja me’n vaig. Fins després!', english: "I'm off now. See you later!", targetWords: ['fins després'] },
  { id: 'u1-7', categoryId: 'greetings', catalan: 'Fins demà a la feina!', english: 'See you tomorrow at work!', targetWords: ['fins demà'] },
  { id: 'u1-8', categoryId: 'greetings', catalan: 'Benvingut a Barcelona, Marc.', english: 'Welcome to Barcelona, Marc.', targetWords: ['benvingut'] },
  { id: 'u1-9', categoryId: 'greetings', catalan: 'Benvinguda a casa nostra, Anna.', english: 'Welcome to our home, Anna.', targetWords: ['benvinguda'] },
  { id: 'u1-10', categoryId: 'greetings', catalan: 'Sí, tens tota la raó.', english: 'Yes, you are quite right.', targetWords: ['sí'] },
  { id: 'u1-11', categoryId: 'greetings', catalan: 'No, gràcies, ara no.', english: 'No, thank you, not now.', targetWords: ['no', 'gràcies'] },
  { id: 'u1-12', categoryId: 'greetings', catalan: 'Un cafè amb llet, si us plau.', english: 'A white coffee, please.', targetWords: ['si us plau'] },
  { id: 'u1-13', categoryId: 'greetings', catalan: 'Passa’m la sal, sisplau.', english: 'Pass me the salt, please.', targetWords: ['sisplau'] },

  // ---------------------------------------------------------------- Unit 2
  { id: 'u2-1', categoryId: 'greetings', catalan: 'Perdoni, com es diu vostè?', english: 'Excuse me, what is your name?', targetWords: ['com es diu', 'perdoni'], grammarConcepts: ['formal-address'] },
  { id: 'u2-2', categoryId: 'greetings', catalan: 'I tu, com et dius?', english: 'And you, what is your name?', targetWords: ['com et dius'] },
  { id: 'u2-3', categoryId: 'greetings', catalan: 'Em dic Laura i sóc de Girona.', english: 'My name is Laura and I am from Girona.', targetWords: ['em dic'] },
  { id: 'u2-4', categoryId: 'greetings', catalan: 'Sóc professor de música.', english: 'I am a music teacher.', targetWords: ['sóc'] },
  { id: 'u2-5', categoryId: 'greetings', catalan: 'Encantat de conèixe’l.', english: 'Very pleased to meet you.', targetWords: ['encantat'] },
  { id: 'u2-6', categoryId: 'greetings', catalan: 'Encantada! Jo sóc la Maria.', english: 'Pleased to meet you! I am Maria.', targetWords: ['encantada'] },
  { id: 'u2-7', categoryId: 'greetings', catalan: 'Hola Pere, com estàs avui?', english: 'Hi Pere, how are you today?', targetWords: ['com estàs'] },
  { id: 'u2-8', categoryId: 'greetings', catalan: 'Bon dia, senyor Roca, com està?', english: 'Good morning, Mr Roca, how are you?', targetWords: ['com està'], grammarConcepts: ['formal-address'] },
  { id: 'u2-9', categoryId: 'greetings', catalan: 'Estic molt bé, gràcies.', english: 'I am very well, thank you.', targetWords: ['molt bé'] },
  { id: 'u2-10', categoryId: 'greetings', catalan: 'Jo estic bé. I tu?', english: 'I am fine. And you?', targetWords: ['i tu'] },
  { id: 'u2-11', categoryId: 'greetings', catalan: 'Nosaltres ja hem dinat. I vostè?', english: 'We have already eaten. And you?', targetWords: ['i vostè'], grammarConcepts: ['formal-address'] },
  { id: 'u2-12', categoryId: 'greetings', catalan: 'Perdó, no t’havia vist.', english: "Sorry, I hadn't seen you.", targetWords: ['perdó'] },
  { id: 'u2-13', categoryId: 'greetings', catalan: 'Parla anglès? No entenc gaire el català.', english: 'Do you speak English? I do not understand much Catalan.', targetWords: ['parla anglès'] },

  // ---------------------------------------------------------------- Unit 3
  { id: 'u3-1', categoryId: 'food', catalan: 'Un cafè sol, si us plau.', english: 'A black coffee, please.', targetWords: ['cafè'] },
  { id: 'u3-2', categoryId: 'food', catalan: 'Prefereixo el te a la tarda.', english: 'I prefer tea in the afternoon.', targetWords: ['te'] },
  { id: 'u3-3', categoryId: 'food', catalan: 'Voldria una ampolla d’aigua freda.', english: 'I would like a bottle of cold water.', targetWords: ['aigua', 'ampolla', 'voldria'] },
  { id: 'u3-4', categoryId: 'food', catalan: 'Dues cerveses ben fredes, sisplau.', english: 'Two very cold beers, please.', targetWords: ['cervesa'] },
  { id: 'u3-5', categoryId: 'food', catalan: 'A taula sempre bevem vi.', english: 'At the table we always drink wine.', targetWords: ['vi'] },
  { id: 'u3-6', categoryId: 'food', catalan: 'El vi negre acompanya bé la carn.', english: 'Red wine goes well with meat.', targetWords: ['vi negre'] },
  { id: 'u3-7', categoryId: 'food', catalan: 'El vi blanc es beu fresc.', english: 'White wine is drunk chilled.', targetWords: ['vi blanc'] },
  { id: 'u3-8', categoryId: 'food', catalan: 'Per esmorzar prenc un suc de taronja.', english: 'For breakfast I have an orange juice.', targetWords: ['suc de taronja'] },
  { id: 'u3-9', categoryId: 'food', catalan: 'El suc de poma és més dolç.', english: 'Apple juice is sweeter.', targetWords: ['suc de poma'] },
  { id: 'u3-10', categoryId: 'food', catalan: 'Els nens beuen llet cada matí.', english: 'The children drink milk every morning.', targetWords: ['llet'] },
  { id: 'u3-11', categoryId: 'food', catalan: 'No poso sucre al cafè.', english: 'I do not put sugar in my coffee.', targetWords: ['sucre'] },
  { id: 'u3-12', categoryId: 'food', catalan: 'Un croissant acabat de fer.', english: 'A freshly made croissant.', targetWords: ['croissant'] },
  { id: 'u3-13', categoryId: 'food', catalan: 'Compro el pa cada dia al forn.', english: 'I buy bread every day at the bakery.', targetWords: ['pa'] },
  { id: 'u3-14', categoryId: 'food', catalan: 'Vull una torrada amb tomàquet.', english: 'I want toast with tomato.', targetWords: ['torrada'] },
  { id: 'u3-15', categoryId: 'food', catalan: 'Ens porta el compte, sisplau?', english: 'Could you bring us the bill, please?', targetWords: ['el compte'] },
  { id: 'u3-16', categoryId: 'food', catalan: 'El cambrer ha estat molt amable.', english: 'The waiter was very kind.', targetWords: ['cambrer'] },
  { id: 'u3-17', categoryId: 'food', catalan: 'La cambrera ens ha recomanat el peix.', english: 'The waitress recommended the fish to us.', targetWords: ['cambrera'] },
  { id: 'u3-18', categoryId: 'food', catalan: 'Puc tenir una mica més de pa?', english: 'Can I have a little more bread?', targetWords: ['puc tenir'] },
  { id: 'u3-19', categoryId: 'food', catalan: 'Quant és tot plegat?', english: 'How much is it altogether?', targetWords: ['quant és'] },
  { id: 'u3-20', categoryId: 'food', catalan: 'Vull un entrepà amb formatge.', english: 'I want a sandwich with cheese.', targetWords: ['amb'] },
  { id: 'u3-21', categoryId: 'food', catalan: 'Prenc el cafè sense sucre.', english: 'I take my coffee without sugar.', targetWords: ['sense'] },
  { id: 'u3-22', categoryId: 'food', catalan: 'Compte, el plat és molt calent.', english: 'Careful, the plate is very hot.', targetWords: ['calent'] },
  { id: 'u3-23', categoryId: 'food', catalan: 'Fa fred i el menjar s’ha quedat fred.', english: 'It is cold and the food has gone cold.', targetWords: ['fred'] },
  { id: 'u3-24', categoryId: 'food', catalan: 'Em pot posar un got d’aigua?', english: 'Could you give me a glass of water?', targetWords: ['got'] },
  { id: 'u3-25', categoryId: 'food', catalan: 'Prefereixo una tassa de te calent.', english: 'I prefer a cup of hot tea.', targetWords: ['tassa'] },

  // ---------------------------------------------------------------- Unit 4
  { id: 'u4-1', categoryId: 'food', catalan: 'No sé què vull menjar primer.', english: 'I do not know what I want to eat first.', targetWords: ['voler'] },
  { id: 'u4-2', categoryId: 'food', catalan: 'Vull anar a la platja demà.', english: 'I want to go to the beach tomorrow.', targetWords: ['vull'] },
  { id: 'u4-3', categoryId: 'food', catalan: 'Vols venir amb nosaltres?', english: 'Do you want to come with us?', targetWords: ['vols'] },
  { id: 'u4-4', categoryId: 'food', catalan: 'Què vols per sopar?', english: 'What do you want for dinner?', targetWords: ['què vols'] },
  { id: 'u4-5', categoryId: 'food', catalan: 'Vaig a prendre un cafè.', english: 'I am going to have a coffee.', targetWords: ['prendre'] },
  { id: 'u4-6', categoryId: 'food', catalan: 'Vols alguna cosa per beure?', english: 'Do you want something to drink?', targetWords: ['alguna cosa', 'beure'] },
  { id: 'u4-7', categoryId: 'food', catalan: 'No vull res, gràcies.', english: 'I do not want anything, thank you.', targetWords: ['res'] },
  { id: 'u4-8', categoryId: 'food', catalan: 'M’agrada menjar a poc a poc.', english: 'I like to eat slowly.', targetWords: ['menjar'] },
  { id: 'u4-9', categoryId: 'food', catalan: 'Un entrepà de pernil, sisplau.', english: 'A ham sandwich, please.', targetWords: ['entrepà', 'pernil'] },
  { id: 'u4-10', categoryId: 'food', catalan: 'Les olives d’aquí són molt bones.', english: 'The olives here are very good.', targetWords: ['olives'] },
  { id: 'u4-11', categoryId: 'food', catalan: 'Els calamars a la romana són típics.', english: 'Battered squid is typical.', targetWords: ['calamars'] },
  { id: 'u4-12', categoryId: 'food', catalan: 'Una aigua mineral, sisplau.', english: 'A mineral water, please.', targetWords: ['aigua mineral'] },
  { id: 'u4-13', categoryId: 'food', catalan: 'La vol amb gas o sense gas?', english: 'Do you want it sparkling or still?', targetWords: ['amb gas', 'sense gas'] },
  { id: 'u4-14', categoryId: 'food', catalan: 'El formatge de cabra és boníssim.', english: 'The goat cheese is delicious.', targetWords: ['formatge'] },
  { id: 'u4-15', categoryId: 'food', catalan: 'De primer, una amanida verda.', english: 'To start, a green salad.', targetWords: ['amanida'] },
  { id: 'u4-16', categoryId: 'food', catalan: 'A l’hivern faig sopa sovint.', english: 'In winter I often make soup.', targetWords: ['sopa'] },
  { id: 'u4-17', categoryId: 'food', catalan: 'No menjo carn des de fa anys.', english: 'I have not eaten meat for years.', targetWords: ['carn'] },
  { id: 'u4-18', categoryId: 'food', catalan: 'El peix del mercat és fresquíssim.', english: 'The fish from the market is very fresh.', targetWords: ['peix'] },
  { id: 'u4-19', categoryId: 'food', catalan: 'Fem pollastre rostit els diumenges.', english: 'We make roast chicken on Sundays.', targetWords: ['pollastre'] },
  { id: 'u4-20', categoryId: 'food', catalan: 'Vull un ou ferrat amb patates.', english: 'I want a fried egg with potatoes.', targetWords: ['ou'] },
  { id: 'u4-21', categoryId: 'food', catalan: 'A casa mengem arròs cada setmana.', english: 'At home we eat rice every week.', targetWords: ['arròs'] },
  { id: 'u4-22', categoryId: 'food', catalan: 'Aquesta patata és massa gran.', english: 'This potato is too big.', targetWords: ['patata'] },
  { id: 'u4-23', categoryId: 'food', catalan: 'El tomàquet madur té més gust.', english: 'A ripe tomato has more flavour.', targetWords: ['tomàquet'] },
  { id: 'u4-24', categoryId: 'food', catalan: 'Tallo la ceba molt fina.', english: 'I chop the onion very finely.', targetWords: ['ceba'] },
  { id: 'u4-25', categoryId: 'food', catalan: 'Poso all a gairebé tots els plats.', english: 'I put garlic in almost every dish.', targetWords: ['all'] },
  { id: 'u4-26', categoryId: 'food', catalan: 'A Catalunya cuinem amb oli d’oliva.', english: 'In Catalonia we cook with olive oil.', targetWords: ['oli'] },
  { id: 'u4-27', categoryId: 'food', catalan: 'Hi falta una mica de sal.', english: 'It needs a little salt.', targetWords: ['sal'] },
  { id: 'u4-28', categoryId: 'food', catalan: 'Afegeix pebre negre al final.', english: 'Add black pepper at the end.', targetWords: ['pebre'] },

  // ---------------------------------------------------------------- Unit 5
  { id: 'u5-1', categoryId: 'daily-life', catalan: 'El meu germà viu a Lleida.', english: 'My brother lives in Lleida.', targetWords: ['el meu'], grammarConcepts: ['possessives'] },
  { id: 'u5-2', categoryId: 'daily-life', catalan: 'La meva feina m’agrada molt.', english: 'I like my job a lot.', targetWords: ['la meva'], grammarConcepts: ['possessives'] },
  { id: 'u5-3', categoryId: 'daily-life', catalan: 'On és el teu cotxe?', english: 'Where is your car?', targetWords: ['el teu'], grammarConcepts: ['possessives'] },
  { id: 'u5-4', categoryId: 'daily-life', catalan: 'La teva idea és molt bona.', english: 'Your idea is very good.', targetWords: ['la teva'], grammarConcepts: ['possessives'] },
  { id: 'u5-5', categoryId: 'daily-life', catalan: 'El seu pare treballa a l’hospital.', english: 'His father works at the hospital.', targetWords: ['el seu'], grammarConcepts: ['possessives'] },
  { id: 'u5-6', categoryId: 'daily-life', catalan: 'La seva casa és a prop del parc.', english: 'Her house is near the park.', targetWords: ['la seva'], grammarConcepts: ['possessives'] },
  { id: 'u5-7', categoryId: 'daily-life', catalan: 'El nostre pis és petit però lluminós.', english: 'Our flat is small but bright.', targetWords: ['el nostre'], grammarConcepts: ['possessives'] },
  { id: 'u5-8', categoryId: 'daily-life', catalan: 'La nostra ciutat és molt tranquil·la.', english: 'Our city is very quiet.', targetWords: ['la nostra'], grammarConcepts: ['possessives'] },
  { id: 'u5-9', categoryId: 'daily-life', catalan: 'He perdut el mòbil altra vegada.', english: 'I have lost my mobile again.', targetWords: ['mòbil'] },
  { id: 'u5-10', categoryId: 'daily-life', catalan: 'El telèfon no para de sonar.', english: 'The telephone will not stop ringing.', targetWords: ['telèfon'] },
  { id: 'u5-11', categoryId: 'daily-life', catalan: 'L’ordinador va molt lent avui.', english: 'The computer is very slow today.', targetWords: ['ordinador'] },
  { id: 'u5-12', categoryId: 'daily-life', catalan: 'Porto el portàtil a la feina.', english: 'I take the laptop to work.', targetWords: ['portàtil'] },
  { id: 'u5-13', categoryId: 'daily-life', catalan: 'T’envio un correu electrònic aquesta tarda.', english: 'I will send you an email this afternoon.', targetWords: ['correu electrònic'] },
  { id: 'u5-14', categoryId: 'daily-life', catalan: 'Em pots donar la teva adreça?', english: 'Can you give me your address?', targetWords: ['adreça'] },
  { id: 'u5-15', categoryId: 'daily-life', catalan: 'No trobo la clau de casa.', english: 'I cannot find my house key.', targetWords: ['clau'] },
  { id: 'u5-16', categoryId: 'daily-life', catalan: 'La cartera era dins la bossa.', english: 'The wallet was inside the bag.', targetWords: ['cartera', 'bossa'] },
  { id: 'u5-17', categoryId: 'daily-life', catalan: 'La maleta pesa massa.', english: 'The suitcase is too heavy.', targetWords: ['maleta'] },
  { id: 'u5-18', categoryId: 'daily-life', catalan: 'Vull tenir més temps lliure.', english: 'I want to have more free time.', targetWords: ['tenir'] },
  { id: 'u5-19', categoryId: 'daily-life', catalan: 'Tinc dos germans i una germana.', english: 'I have two brothers and a sister.', targetWords: ['tinc'] },
  { id: 'u5-20', categoryId: 'daily-life', catalan: 'Vull poder parlar català amb fluïdesa.', english: 'I want to be able to speak Catalan fluently.', targetWords: ['poder'] },
  { id: 'u5-21', categoryId: 'daily-life', catalan: 'Hi ha molta gent a la plaça.', english: 'There are a lot of people in the square.', targetWords: ['hi ha'] },
  { id: 'u5-22', categoryId: 'daily-life', catalan: 'Aquest llibre és molt interessant.', english: 'This book is very interesting.', targetWords: ['llibre'] },
  { id: 'u5-23', categoryId: 'daily-life', catalan: 'Em deixes un bolígraf?', english: 'Will you lend me a pen?', targetWords: ['bolígraf'] },
  { id: 'u5-24', categoryId: 'daily-life', catalan: 'Necessito un full de paper.', english: 'I need a sheet of paper.', targetWords: ['paper'] },

  // ---------------------------------------------------------------- Unit 6
  { id: 'u6-1', categoryId: 'family', catalan: 'La meva família és bastant gran.', english: 'My family is quite large.', targetWords: ['família'] },
  { id: 'u6-2', categoryId: 'family', catalan: 'El meu pare és de Tarragona.', english: 'My father is from Tarragona.', targetWords: ['pare'] },
  { id: 'u6-3', categoryId: 'family', catalan: 'La meva mare cuina molt bé.', english: 'My mother cooks very well.', targetWords: ['mare'] },
  { id: 'u6-4', categoryId: 'family', catalan: 'Els meus pares viuen al camp.', english: 'My parents live in the countryside.', targetWords: ['pares'] },
  { id: 'u6-5', categoryId: 'family', catalan: 'El meu germà estudia medicina.', english: 'My brother studies medicine.', targetWords: ['germà'] },
  { id: 'u6-6', categoryId: 'family', catalan: 'La meva germana toca el piano.', english: 'My sister plays the piano.', targetWords: ['germana'] },
  { id: 'u6-7', categoryId: 'family', catalan: 'El seu fill té sis anys.', english: 'Their son is six years old.', targetWords: ['fill'] },
  { id: 'u6-8', categoryId: 'family', catalan: 'La seva filla va a l’escola.', english: 'Their daughter goes to school.', targetWords: ['filla'] },
  { id: 'u6-9', categoryId: 'family', catalan: 'Tenen tres fills petits.', english: 'They have three small children.', targetWords: ['fills'] },
  { id: 'u6-10', categoryId: 'family', catalan: 'El meu avi explica bones històries.', english: 'My grandfather tells good stories.', targetWords: ['avi'] },
  { id: 'u6-11', categoryId: 'family', catalan: 'L’àvia fa una coca boníssima.', english: 'Grandma makes a delicious cake.', targetWords: ['àvia'] },
  { id: 'u6-12', categoryId: 'family', catalan: 'Els avis viuen a prop nostre.', english: 'My grandparents live near us.', targetWords: ['avis'] },
  { id: 'u6-13', categoryId: 'family', catalan: 'El seu nét ja camina.', english: 'Their grandson can already walk.', targetWords: ['nét'] },
  { id: 'u6-14', categoryId: 'family', catalan: 'La néta s’assembla a la seva mare.', english: 'The granddaughter looks like her mother.', targetWords: ['néta'] },
  { id: 'u6-15', categoryId: 'family', catalan: 'El seu marit és arquitecte.', english: 'Her husband is an architect.', targetWords: ['marit'] },
  { id: 'u6-16', categoryId: 'family', catalan: 'La seva muller treballa a la universitat.', english: 'His wife works at the university.', targetWords: ['muller'] },
  { id: 'u6-17', categoryId: 'family', catalan: 'El meu oncle viu a França.', english: 'My uncle lives in France.', targetWords: ['oncle'] },
  { id: 'u6-18', categoryId: 'family', catalan: 'La tieta ve a dinar diumenge.', english: 'My aunt is coming to lunch on Sunday.', targetWords: ['tieta'] },
  { id: 'u6-19', categoryId: 'family', catalan: 'El meu cosí juga a bàsquet.', english: 'My cousin plays basketball.', targetWords: ['cosí'] },
  { id: 'u6-20', categoryId: 'family', catalan: 'La meva cosina viu a Menorca.', english: 'My cousin lives in Menorca.', targetWords: ['cosina'] },
  { id: 'u6-21', categoryId: 'family', catalan: 'El meu nebot fa quatre anys.', english: 'My nephew is turning four.', targetWords: ['nebot'] },
  { id: 'u6-22', categoryId: 'family', catalan: 'La neboda estudia a l’estranger.', english: 'My niece studies abroad.', targetWords: ['neboda'] },
  { id: 'u6-23', categoryId: 'family', catalan: 'El seu xicot és molt simpàtic.', english: 'Her boyfriend is very nice.', targetWords: ['xicot'] },
  { id: 'u6-24', categoryId: 'family', catalan: 'La seva xicota parla quatre idiomes.', english: 'His girlfriend speaks four languages.', targetWords: ['xicota'] },
  { id: 'u6-25', categoryId: 'family', catalan: 'Un amic meu viu a Sitges.', english: 'A friend of mine lives in Sitges.', targetWords: ['amic'] },
  { id: 'u6-26', categoryId: 'family', catalan: 'La meva amiga Marta ve demà.', english: 'My friend Marta is coming tomorrow.', targetWords: ['amiga'] },
  { id: 'u6-27', categoryId: 'family', catalan: 'Quants anys tens?', english: 'How old are you?', targetWords: ['quants anys tens'] },
  { id: 'u6-28', categoryId: 'family', catalan: 'És encara molt jove per conduir.', english: 'He is still too young to drive.', targetWords: ['jove'] },
  { id: 'u6-29', categoryId: 'family', catalan: 'Aquest arbre és molt vell.', english: 'This tree is very old.', targetWords: ['vell'] },
  { id: 'u6-30', categoryId: 'family', catalan: 'La casa és vella però bonica.', english: 'The house is old but beautiful.', targetWords: ['vella'] },
  { id: 'u6-31', categoryId: 'family', catalan: 'El meu germà està casat.', english: 'My brother is married.', targetWords: ['casat'] },
  { id: 'u6-32', categoryId: 'family', catalan: 'La meva cosina encara està soltera.', english: 'My cousin is still single.', targetWords: ['soltera'] },

  // ---------------------------------------------------------------- Unit 7
  { id: 'u7-1', categoryId: 'directions', catalan: 'On és l’estació, sisplau?', english: 'Where is the station, please?', targetWords: ['on és'] },
  { id: 'u7-2', categoryId: 'directions', catalan: 'Visc en aquest carrer.', english: 'I live on this street.', targetWords: ['carrer'] },
  { id: 'u7-3', categoryId: 'directions', catalan: 'Ens trobem a la plaça Catalunya.', english: 'We are meeting at Plaça Catalunya.', targetWords: ['plaça'] },
  { id: 'u7-4', categoryId: 'directions', catalan: 'L’avinguda Diagonal és molt llarga.', english: 'Avinguda Diagonal is very long.', targetWords: ['avinguda'] },
  { id: 'u7-5', categoryId: 'directions', catalan: 'Gira a l’esquerra al semàfor.', english: 'Turn left at the traffic light.', targetWords: ['esquerra'] },
  { id: 'u7-6', categoryId: 'directions', catalan: 'La farmàcia queda a la dreta.', english: 'The pharmacy is on the right.', targetWords: ['dreta', 'farmàcia'] },
  { id: 'u7-7', categoryId: 'directions', catalan: 'Segueix tot recte fins al final.', english: 'Go straight ahead to the end.', targetWords: ['tot recte'] },
  { id: 'u7-8', categoryId: 'directions', catalan: 'El museu és a prop d’aquí.', english: 'The museum is near here.', targetWords: ['a prop', 'museu'] },
  { id: 'u7-9', categoryId: 'directions', catalan: 'L’aeroport és bastant lluny.', english: 'The airport is quite far.', targetWords: ['lluny'] },
  { id: 'u7-10', categoryId: 'directions', catalan: 'Aquí fa massa soroll.', english: 'It is too noisy here.', targetWords: ['aquí'] },
  { id: 'u7-11', categoryId: 'directions', catalan: 'El teu llibre és allà, damunt la taula.', english: 'Your book is over there, on the table.', targetWords: ['allà'] },
  { id: 'u7-12', categoryId: 'directions', catalan: 'Hi ha un banc davant de l’església.', english: 'There is a bank in front of the church.', targetWords: ['davant de', 'banc', 'església'] },
  { id: 'u7-13', categoryId: 'directions', catalan: 'L’aparcament és darrere de l’hotel.', english: 'The car park is behind the hotel.', targetWords: ['darrere de', 'hotel'] },
  { id: 'u7-14', categoryId: 'directions', catalan: 'El supermercat és al costat del parc.', english: 'The supermarket is next to the park.', targetWords: ['al costat de', 'supermercat', 'parc'] },
  { id: 'u7-15', categoryId: 'directions', catalan: 'La botiga és entre el banc i el bar.', english: 'The shop is between the bank and the bar.', targetWords: ['entre'] },
  { id: 'u7-16', categoryId: 'directions', catalan: 'Agafa el primer carrer a la dreta.', english: 'Take the first street on the right.', targetWords: ['primer'] },
  { id: 'u7-17', categoryId: 'directions', catalan: 'Visc al segon pis.', english: 'I live on the second floor.', targetWords: ['segon'] },
  { id: 'u7-18', categoryId: 'directions', catalan: 'És la tercera porta a l’esquerra.', english: 'It is the third door on the left.', targetWords: ['tercera'] },
  { id: 'u7-19', categoryId: 'directions', catalan: 'Ens veiem a la cantonada.', english: 'See you at the corner.', targetWords: ['cantonada'] },
  { id: 'u7-20', categoryId: 'directions', catalan: 'L’hospital és al final de l’avinguda.', english: 'The hospital is at the end of the avenue.', targetWords: ['hospital'] },
  { id: 'u7-21', categoryId: 'directions', catalan: 'Aquest restaurant és molt conegut.', english: 'This restaurant is very well known.', targetWords: ['restaurant'] },
  { id: 'u7-22', categoryId: 'directions', catalan: 'A l’estiu anem a la platja cada dia.', english: 'In summer we go to the beach every day.', targetWords: ['platja'] },
  { id: 'u7-23', categoryId: 'directions', catalan: 'Sap on és la parada del metro?', english: 'Do you know where the metro stop is?', targetWords: ['sap on és'] },
  { id: 'u7-24', categoryId: 'directions', catalan: 'Com puc arribar a la Sagrada Família?', english: 'How do I get to the Sagrada Família?', targetWords: ['com puc arribar a'] },

  // ---------------------------------------------------------------- Unit 8
  { id: 'u8-1', categoryId: 'numbers', catalan: 'Només en vull un.', english: 'I only want one.', targetWords: ['un'] },
  { id: 'u8-2', categoryId: 'numbers', catalan: 'Tinc dos gats i un gos.', english: 'I have two cats and a dog.', targetWords: ['dos'] },
  { id: 'u8-3', categoryId: 'numbers', catalan: 'Vindrem d’aquí a tres dies.', english: 'We will come in three days.', targetWords: ['tres'] },
  { id: 'u8-4', categoryId: 'numbers', catalan: 'Som quatre a taula.', english: 'There are four of us at the table.', targetWords: ['quatre'] },
  { id: 'u8-5', categoryId: 'numbers', catalan: 'El tren surt a les cinc.', english: 'The train leaves at five.', targetWords: ['cinc'] },
  { id: 'u8-6', categoryId: 'numbers', catalan: 'Fa sis mesos que estudio català.', english: 'I have been studying Catalan for six months.', targetWords: ['sis'] },
  { id: 'u8-7', categoryId: 'numbers', catalan: 'La setmana té set dies.', english: 'The week has seven days.', targetWords: ['set'] },
  { id: 'u8-8', categoryId: 'numbers', catalan: 'Obren a les vuit del matí.', english: 'They open at eight in the morning.', targetWords: ['vuit'] },
  { id: 'u8-9', categoryId: 'numbers', catalan: 'En queden nou a la caixa.', english: 'There are nine left in the box.', targetWords: ['nou'] },
  { id: 'u8-10', categoryId: 'numbers', catalan: 'Costa deu euros.', english: 'It costs ten euros.', targetWords: ['deu'] },
  { id: 'u8-11', categoryId: 'numbers', catalan: 'Té onze anys.', english: 'He is eleven years old.', targetWords: ['onze'] },
  { id: 'u8-12', categoryId: 'numbers', catalan: 'L’any té dotze mesos.', english: 'The year has twelve months.', targetWords: ['dotze'] },
  { id: 'u8-13', categoryId: 'numbers', catalan: 'Arribo d’aquí a quinze minuts.', english: 'I will arrive in fifteen minutes.', targetWords: ['quinze'] },
  { id: 'u8-14', categoryId: 'numbers', catalan: 'Tinc vint-i-cinc anys.', english: 'I am twenty-five years old.', targetWords: ['vint'] },
  { id: 'u8-15', categoryId: 'numbers', catalan: 'Hi havia trenta persones a la sala.', english: 'There were thirty people in the room.', targetWords: ['trenta'] },
  { id: 'u8-16', categoryId: 'numbers', catalan: 'El bitllet val quaranta euros.', english: 'The ticket costs forty euros.', targetWords: ['quaranta'] },
  { id: 'u8-17', categoryId: 'numbers', catalan: 'Són tres euros amb cinquanta.', english: 'That is three euros fifty.', targetWords: ['cinquanta'] },
  { id: 'u8-18', categoryId: 'numbers', catalan: 'Hi caben cent persones.', english: 'It holds a hundred people.', targetWords: ['cent'] },
  { id: 'u8-19', categoryId: 'numbers', catalan: 'El llibre té mil pàgines.', english: 'The book has a thousand pages.', targetWords: ['mil'] },
  { id: 'u8-20', categoryId: 'numbers', catalan: 'El pis de dalt és molt sorollós.', english: 'The flat upstairs is very noisy.', targetWords: ['pis'] },
  { id: 'u8-21', categoryId: 'numbers', catalan: 'Truca a la porta abans d’entrar.', english: 'Knock on the door before coming in.', targetWords: ['porta'] },
  { id: 'u8-22', categoryId: 'numbers', catalan: 'La nostra casa té un jardí petit.', english: 'Our house has a small garden.', targetWords: ['casa'] },
  { id: 'u8-23', categoryId: 'numbers', catalan: 'Visc en un bloc de vuit plantes.', english: 'I live in an eight-storey block.', targetWords: ['bloc'] },
  { id: 'u8-24', categoryId: 'numbers', catalan: 'Puja per les escales, és més ràpid.', english: 'Go up the stairs, it is quicker.', targetWords: ['escales'] },
  { id: 'u8-25', categoryId: 'numbers', catalan: 'L’ascensor no funciona avui.', english: 'The lift is not working today.', targetWords: ['ascensor'] },
  { id: 'u8-26', categoryId: 'numbers', catalan: 'On vius exactament?', english: 'Where exactly do you live?', targetWords: ['on vius'] },

  // ---------------------------------------------------------------- Unit 9
  { id: 'u9-1', categoryId: 'describing', catalan: 'M’agrada passejar pel barri Gòtic.', english: 'I like to stroll through the Gothic Quarter.', targetWords: ['passejar'] },
  { id: 'u9-2', categoryId: 'describing', catalan: 'Quin dia més bonic!', english: 'What a beautiful day!', targetWords: ['bonic'] },
  { id: 'u9-3', categoryId: 'describing', catalan: 'La conferència va ser molt interessant.', english: 'The talk was very interesting.', targetWords: ['interessant'] },
  { id: 'u9-4', categoryId: 'describing', catalan: 'Gaudí és un arquitecte famós.', english: 'Gaudí is a famous architect.', targetWords: ['famós'] },
  { id: 'u9-5', categoryId: 'describing', catalan: 'Aquest edifici és molt antic.', english: 'This building is very old.', targetWords: ['antic', 'edifici'] },
  { id: 'u9-6', categoryId: 'describing', catalan: 'Prefereixo l’art modern.', english: 'I prefer modern art.', targetWords: ['modern'] },
  { id: 'u9-7', categoryId: 'describing', catalan: 'Barcelona és una ciutat gran.', english: 'Barcelona is a big city.', targetWords: ['gran', 'ciutat'] },
  { id: 'u9-8', categoryId: 'describing', catalan: 'Viuen en un poble petit.', english: 'They live in a small village.', targetWords: ['petit'] },
  { id: 'u9-9', categoryId: 'describing', catalan: 'El port és ple de vaixells.', english: 'The harbour is full of boats.', targetWords: ['port'] },
  { id: 'u9-10', categoryId: 'describing', catalan: 'Hi havia molta gent al carrer.', english: 'There were a lot of people in the street.', targetWords: ['gent'] },
  { id: 'u9-11', categoryId: 'describing', catalan: 'Un turista m’ha demanat indicacions.', english: 'A tourist asked me for directions.', targetWords: ['turista'] },
  { id: 'u9-12', categoryId: 'describing', catalan: 'Porto un jersei vermell.', english: 'I am wearing a red jumper.', targetWords: ['vermell'] },
  { id: 'u9-13', categoryId: 'describing', catalan: 'El cel és molt blau avui.', english: 'The sky is very blue today.', targetWords: ['blau'] },
  { id: 'u9-14', categoryId: 'describing', catalan: 'El semàfor s’ha posat verd.', english: 'The traffic light has turned green.', targetWords: ['verd'] },
  { id: 'u9-15', categoryId: 'describing', catalan: 'Ha comprat un cotxe groc.', english: 'She has bought a yellow car.', targetWords: ['groc'] },
  { id: 'u9-16', categoryId: 'describing', catalan: 'Duu una camisa blanca.', english: 'He is wearing a white shirt.', targetWords: ['blanca'] },
  { id: 'u9-17', categoryId: 'describing', catalan: 'El gat negre dorm al sofà.', english: 'The black cat is sleeping on the sofa.', targetWords: ['negre'] },
  { id: 'u9-18', categoryId: 'describing', catalan: 'Té els ulls marrons.', english: 'She has brown eyes.', targetWords: ['marró'] },
  { id: 'u9-19', categoryId: 'describing', catalan: 'Avui el cel està gris.', english: 'The sky is grey today.', targetWords: ['gris'] },
  { id: 'u9-20', categoryId: 'describing', catalan: 'M’agrada el color taronja.', english: 'I like the colour orange.', targetWords: ['taronja'] },
  { id: 'u9-21', categoryId: 'describing', catalan: 'M’agrada molt el color rosa.', english: 'I really like the colour pink.', targetWords: ['rosa'] },
  { id: 'u9-22', categoryId: 'describing', catalan: 'Porta una bufanda lila.', english: 'She is wearing a purple scarf.', targetWords: ['lila'] },

  // ---------------------------------------------------------------- Unit 10
  { id: 'u10-1', categoryId: 'shopping', catalan: 'Anem al mercat cada dissabte.', english: 'We go to the market every Saturday.', targetWords: ['mercat'] },
  { id: 'u10-2', categoryId: 'shopping', catalan: 'La botiga tanca a les vuit.', english: 'The shop closes at eight.', targetWords: ['botiga'] },
  { id: 'u10-3', categoryId: 'shopping', catalan: 'Menjo fruita cada dia.', english: 'I eat fruit every day.', targetWords: ['fruita'] },
  { id: 'u10-4', categoryId: 'shopping', catalan: 'Les verdures són molt fresques.', english: 'The vegetables are very fresh.', targetWords: ['verdures'] },
  { id: 'u10-5', categoryId: 'shopping', catalan: 'Aquesta poma és molt dolça.', english: 'This apple is very sweet.', targetWords: ['poma'] },
  { id: 'u10-6', categoryId: 'shopping', catalan: 'Em pot posar mig quilo de plàtans?', english: 'Can you give me half a kilo of bananas?', targetWords: ['plàtan', 'mig quilo'] },
  { id: 'u10-7', categoryId: 'shopping', catalan: 'La maduixa és la meva fruita preferida.', english: 'Strawberry is my favourite fruit.', targetWords: ['maduixa'] },
  { id: 'u10-8', categoryId: 'shopping', catalan: 'El raïm d’aquesta zona és excel·lent.', english: 'The grapes from this area are excellent.', targetWords: ['raïm'] },
  { id: 'u10-9', categoryId: 'shopping', catalan: 'Necessito una llimona per al peix.', english: 'I need a lemon for the fish.', targetWords: ['llimona'] },
  { id: 'u10-10', categoryId: 'shopping', catalan: 'El préssec és de temporada.', english: 'The peach is in season.', targetWords: ['préssec'] },
  { id: 'u10-11', categoryId: 'shopping', catalan: 'Vull una pera ben madura.', english: 'I want a really ripe pear.', targetWords: ['pera', 'madura'] },
  { id: 'u10-12', categoryId: 'shopping', catalan: 'Poso enciam a l’amanida.', english: 'I put lettuce in the salad.', targetWords: ['enciam'] },
  { id: 'u10-13', categoryId: 'shopping', catalan: 'La pastanaga és bona per a la vista.', english: 'Carrots are good for your eyesight.', targetWords: ['pastanaga'] },
  { id: 'u10-14', categoryId: 'shopping', catalan: 'Aquest pebrot és molt vermell.', english: 'This pepper is very red.', targetWords: ['pebrot'] },
  { id: 'u10-15', categoryId: 'shopping', catalan: 'Em posa un quilo de tomàquets?', english: 'Can you give me a kilo of tomatoes?', targetWords: ['quilo', 'em posa'] },
  { id: 'u10-16', categoryId: 'shopping', catalan: 'Cent grams de pernil, sisplau.', english: 'A hundred grams of ham, please.', targetWords: ['gram'] },
  { id: 'u10-17', categoryId: 'shopping', catalan: 'El preu ha pujat molt.', english: 'The price has gone up a lot.', targetWords: ['preu'] },
  { id: 'u10-18', categoryId: 'shopping', catalan: 'Aquest vi és bo i barat.', english: 'This wine is good and cheap.', targetWords: ['barat'] },
  { id: 'u10-19', categoryId: 'shopping', catalan: 'El peix és molt car aquesta setmana.', english: 'Fish is very expensive this week.', targetWords: ['car'] },
  { id: 'u10-20', categoryId: 'shopping', catalan: 'Quant costa el formatge?', english: 'How much does the cheese cost?', targetWords: ['quant costa'] },
  { id: 'u10-21', categoryId: 'shopping', catalan: 'Vull comprar pa per a demà.', english: 'I want to buy bread for tomorrow.', targetWords: ['comprar'] },
  { id: 'u10-22', categoryId: 'shopping', catalan: 'Puc pagar amb targeta?', english: 'Can I pay by card?', targetWords: ['pagar'] },
  { id: 'u10-23', categoryId: 'shopping', catalan: 'Aquí venen fruita molt bona.', english: 'They sell very good fruit here.', targetWords: ['vendre'] },
  { id: 'u10-24', categoryId: 'shopping', catalan: 'Alguna cosa més, senyora?', english: 'Anything else, madam?', targetWords: ['alguna cosa més'] },

  // ---------------------------------------------------------------- Unit 11
  { id: 'u11-1', categoryId: 'opinions', catalan: 'Prefereixo el te al cafè.', english: 'I prefer tea to coffee.', targetWords: ['preferir'] },
  { id: 'u11-2', categoryId: 'opinions', catalan: 'Aquesta opció és molt millor.', english: 'This option is much better.', targetWords: ['millor'] },
  { id: 'u11-3', categoryId: 'opinions', catalan: 'El temps és pitjor que ahir.', english: 'The weather is worse than yesterday.', targetWords: ['pitjor'] },
  { id: 'u11-4', categoryId: 'opinions', catalan: 'Aquest pa és molt bo.', english: 'This bread is very good.', targetWords: ['bo'] },
  { id: 'u11-5', categoryId: 'opinions', catalan: 'Ha estat un dia dolent.', english: 'It has been a bad day.', targetWords: ['dolent'] },
  { id: 'u11-6', categoryId: 'opinions', catalan: 'M’agrada molt aquesta cançó.', english: 'I like this song a lot.', targetWords: ['molt'] },
  { id: 'u11-7', categoryId: 'opinions', catalan: 'Parlo una mica de francès.', english: 'I speak a little French.', targetWords: ['una mica'] },
  { id: 'u11-8', categoryId: 'opinions', catalan: 'Ja n’hi ha prou, gràcies.', english: 'That is enough, thank you.', targetWords: ['prou'] },
  { id: 'u11-9', categoryId: 'opinions', catalan: 'Hi has posat massa sal.', english: 'You have put too much salt in it.', targetWords: ['massa'] },
  { id: 'u11-10', categoryId: 'opinions', catalan: 'El peix ha de ser ben fresc.', english: 'The fish must be really fresh.', targetWords: ['fresc'] },

  // ---------------------------------------------------------------- Unit 12
  { id: 'u12-1', categoryId: 'restaurant', catalan: 'Ens porta la carta, sisplau?', english: 'Could you bring us the menu, please?', targetWords: ['carta'] },
  { id: 'u12-2', categoryId: 'restaurant', catalan: 'De primer vull un entrant fred.', english: 'To start I want a cold appetizer.', targetWords: ['entrant'] },
  { id: 'u12-3', categoryId: 'restaurant', catalan: 'Quin és el plat principal?', english: 'What is the main course?', targetWords: ['plat principal'] },
  { id: 'u12-4', categoryId: 'restaurant', catalan: 'De postres vull gelat.', english: 'For dessert I want ice cream.', targetWords: ['postres'] },
  { id: 'u12-5', categoryId: 'restaurant', catalan: 'La paella de marisc és per a dues persones.', english: 'The seafood paella is for two people.', targetWords: ['paella'] },
  { id: 'u12-6', categoryId: 'restaurant', catalan: 'Aquest pastís és deliciós.', english: 'This cake is delicious.', targetWords: ['deliciós'] },
  { id: 'u12-7', categoryId: 'restaurant', catalan: 'Què recomana avui?', english: 'What do you recommend today?', targetWords: ['què recomana'] },
  { id: 'u12-8', categoryId: 'restaurant', catalan: 'El compte, sisplau.', english: 'The bill, please.', targetWords: ['el compte, sisplau'] },
  { id: 'u12-9', categoryId: 'restaurant', catalan: 'No m’agrada el menjar picant.', english: 'I do not like spicy food.', targetWords: ['picant'] },
  { id: 'u12-10', categoryId: 'restaurant', catalan: 'Aquest vi és massa dolç.', english: 'This wine is too sweet.', targetWords: ['dolç'] },
  { id: 'u12-11', categoryId: 'restaurant', catalan: 'La sopa està una mica salada.', english: 'The soup is a little salty.', targetWords: ['salada'] },
  { id: 'u12-12', categoryId: 'restaurant', catalan: 'El cafè és amarg sense sucre.', english: 'Coffee is bitter without sugar.', targetWords: ['amarg'] },
  { id: 'u12-13', categoryId: 'restaurant', catalan: 'No menjo peix cru.', english: 'I do not eat raw fish.', targetWords: ['cru'] },
  { id: 'u12-14', categoryId: 'restaurant', catalan: 'La carn està ben cuita.', english: 'The meat is well cooked.', targetWords: ['cuita'] },
  { id: 'u12-15', categoryId: 'restaurant', catalan: 'Prefereixo el peix a la planxa que fregit.', english: 'I prefer grilled fish to fried.', targetWords: ['a la planxa', 'fregit'] },

  // ---------------------------------------------------------------- Unit 13
  { id: 'u13-1', categoryId: 'daily-life', catalan: 'Em desperto a les set cada matí.', english: 'I wake up at seven every morning.', targetWords: ['despertar-se', 'matí'], grammarConcepts: ['reflexive-verbs'] },
  { id: 'u13-2', categoryId: 'daily-life', catalan: 'Em llevo de seguida.', english: 'I get up straight away.', targetWords: ['llevar-se'], grammarConcepts: ['reflexive-verbs'] },
  { id: 'u13-3', categoryId: 'daily-life', catalan: 'Em dutxo abans d’esmorzar.', english: 'I shower before having breakfast.', targetWords: ['dutxar-se', 'esmorzar'], grammarConcepts: ['reflexive-verbs'] },
  { id: 'u13-4', categoryId: 'daily-life', catalan: 'Treballo de nou a cinc.', english: 'I work from nine to five.', targetWords: ['treballar'] },
  { id: 'u13-5', categoryId: 'daily-life', catalan: 'Dino a la feina cada dia.', english: 'I have lunch at work every day.', targetWords: ['dinar'] },
  { id: 'u13-6', categoryId: 'daily-life', catalan: 'Sopem cap a les nou.', english: 'We have dinner around nine.', targetWords: ['sopar'] },
  { id: 'u13-7', categoryId: 'daily-life', catalan: 'Dormo vuit hores cada nit.', english: 'I sleep eight hours every night.', targetWords: ['dormir'] },
  { id: 'u13-8', categoryId: 'daily-life', catalan: 'Aquesta tarda vaig al gimnàs.', english: 'This afternoon I am going to the gym.', targetWords: ['tarda'] },
  { id: 'u13-9', categoryId: 'daily-life', catalan: 'Al vespre mirem una pel·lícula.', english: 'In the evening we watch a film.', targetWords: ['vespre'] },
  { id: 'u13-10', categoryId: 'time', catalan: 'Quina hora és, sisplau?', english: 'What time is it, please?', targetWords: ['quina hora és'] },
  { id: 'u13-11', categoryId: 'time', catalan: 'A quina hora comença la classe?', english: 'What time does the class start?', targetWords: ['a quina hora'] },
  { id: 'u13-12', categoryId: 'time', catalan: 'Avui he arribat aviat.', english: 'Today I arrived early.', targetWords: ['aviat'] },
  { id: 'u13-13', categoryId: 'time', catalan: 'Sempre arribo tard als llocs.', english: 'I always arrive late.', targetWords: ['tard'] },
  { id: 'u13-14', categoryId: 'daily-life', catalan: 'Em rento les dents tres cops al dia.', english: 'I brush my teeth three times a day.', targetWords: ['rentar-se les dents'] },
  { id: 'u13-15', categoryId: 'daily-life', catalan: 'Em vesteixo de pressa al matí.', english: 'I get dressed quickly in the morning.', targetWords: ['vestir-se'] },
  { id: 'u13-16', categoryId: 'daily-life', catalan: 'Vaig a dormir a les onze.', english: 'I go to bed at eleven.', targetWords: ['anar a dormir'] },
  { id: 'u13-17', categoryId: 'daily-life', catalan: 'El diumenge m’agrada descansar.', english: 'On Sundays I like to rest.', targetWords: ['descansar'] },
  { id: 'u13-18', categoryId: 'daily-life', catalan: 'M’agrada llegir abans de dormir.', english: 'I like to read before sleeping.', targetWords: ['llegir'] },
  { id: 'u13-19', categoryId: 'daily-life', catalan: 'No m’agrada mirar la televisió.', english: 'I do not like watching television.', targetWords: ['mirar la televisió'] },
  { id: 'u13-20', categoryId: 'daily-life', catalan: 'Estudio català dues hores al dia.', english: 'I study Catalan two hours a day.', targetWords: ['estudiar'] },
  { id: 'u13-21', categoryId: 'daily-life', catalan: 'M’agrada cuinar per als amics.', english: 'I like to cook for friends.', targetWords: ['cuinar'] },
  { id: 'u13-22', categoryId: 'daily-life', catalan: 'La meva rutina no canvia mai.', english: 'My routine never changes.', targetWords: ['rutina'] },
  { id: 'u13-23', categoryId: 'daily-life', catalan: 'Tinc un horari molt complicat.', english: 'I have a very complicated schedule.', targetWords: ['horari'] },

  // ---------------------------------------------------------------- Unit 14
  { id: 'u14-1', categoryId: 'past-events', catalan: 'Avui no he sortit de casa.', english: 'Today I have not left the house.', targetWords: ['avui'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-2', categoryId: 'past-events', catalan: 'Aquest matí he anat al metge.', english: 'This morning I went to the doctor.', targetWords: ['aquest matí'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-3', categoryId: 'past-events', catalan: 'Aquesta tarda he estudiat molt.', english: 'This afternoon I studied a lot.', targetWords: ['aquesta tarda'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-4', categoryId: 'past-events', catalan: 'Ja he acabat la feina.', english: 'I have already finished the work.', targetWords: ['ja', 'he acabat'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-5', categoryId: 'past-events', catalan: 'Encara no he dinat.', english: 'I have not had lunch yet.', targetWords: ['encara'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-6', categoryId: 'past-events', catalan: 'Què has fet avui? Jo he fet molta feina.', english: 'What have you done today? I have done a lot of work.', targetWords: ['he fet'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-7', categoryId: 'past-events', catalan: 'He estat a Menorca dues vegades.', english: 'I have been to Menorca twice.', targetWords: ['he estat'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-8', categoryId: 'past-events', catalan: 'He menjat massa aquest migdia.', english: 'I have eaten too much at lunchtime.', targetWords: ['he menjat'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-9', categoryId: 'past-events', catalan: 'He vist una pel·lícula molt bona.', english: 'I have seen a very good film.', targetWords: ['he vist'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-10', categoryId: 'past-events', catalan: 'Vull sortir aquesta nit.', english: 'I want to go out tonight.', targetWords: ['sortir'] },
  { id: 'u14-11', categoryId: 'past-events', catalan: 'El tren ha d’arribar a les vuit.', english: 'The train should arrive at eight.', targetWords: ['arribar'] },
  { id: 'u14-12', categoryId: 'past-events', catalan: 'Vaig visitar el museu Picasso.', english: 'I visited the Picasso museum.', targetWords: ['visitar'] },
  { id: 'u14-13', categoryId: 'past-events', catalan: 'No hi he estat mai.', english: 'I have never been there.', targetWords: ['mai'] },
  { id: 'u14-14', categoryId: 'past-events', catalan: 'He comprat pa i llet.', english: 'I have bought bread and milk.', targetWords: ['he comprat'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-15', categoryId: 'past-events', catalan: 'He parlat amb la teva germana.', english: 'I have spoken with your sister.', targetWords: ['he parlat'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-16', categoryId: 'past-events', catalan: 'He escrit una carta llarga.', english: 'I have written a long letter.', targetWords: ['he escrit'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-17', categoryId: 'past-events', catalan: 'He llegit aquest llibre dues vegades.', english: 'I have read this book twice.', targetWords: ['he llegit'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-18', categoryId: 'past-events', catalan: 'He treballat tot el cap de setmana.', english: 'I have worked all weekend.', targetWords: ['he treballat'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-19', categoryId: 'past-events', catalan: 'He començat un curs de català.', english: 'I have started a Catalan course.', targetWords: ['he començat'], grammarConcepts: ['perfect-tense'] },
  { id: 'u14-20', categoryId: 'past-events', catalan: 'Acabo d’arribar a casa.', english: 'I have just arrived home.', targetWords: ['acabar de'] },
  { id: 'u14-21', categoryId: 'past-events', catalan: 'Darrerament dormo malament.', english: 'Lately I have been sleeping badly.', targetWords: ['darrerament'] },
  { id: 'u14-22', categoryId: 'past-events', catalan: 'Recentment hem canviat de pis.', english: 'We have recently moved flat.', targetWords: ['recentment'] },

  // ---------------------------------------------------------------- Unit 15
  { id: 'u15-1', categoryId: 'opinions', catalan: 'Què en penses, tu?', english: 'What do you think about it?', targetWords: ['pensar'] },
  { id: 'u15-2', categoryId: 'opinions', catalan: 'No m’ho puc creure!', english: 'I cannot believe it!', targetWords: ['creure'] },
  { id: 'u15-3', categoryId: 'opinions', catalan: 'Penso que tens raó.', english: 'I think you are right.', targetWords: ['penso que'] },
  { id: 'u15-4', categoryId: 'opinions', catalan: 'Segons jo, és una bona idea.', english: 'In my opinion, it is a good idea.', targetWords: ['segons jo'] },
  { id: 'u15-5', categoryId: 'opinions', catalan: 'Potser vindrem més tard.', english: 'Perhaps we will come later.', targetWords: ['potser'] },
  { id: 'u15-6', categoryId: 'opinions', catalan: 'És clar que hi anirem!', english: 'Of course we will go!', targetWords: ['és clar'] },
  { id: 'u15-7', categoryId: 'opinions', catalan: 'De veritat? No en tenia ni idea.', english: 'Really? I had no idea.', targetWords: ['de veritat'] },
  { id: 'u15-8', categoryId: 'opinions', catalan: 'La pel·lícula era molt avorrida.', english: 'The film was very boring.', targetWords: ['avorrida'] },
  { id: 'u15-9', categoryId: 'opinions', catalan: 'Ha estat una nit molt divertida.', english: 'It has been a very fun night.', targetWords: ['divertida'] },
  { id: 'u15-10', categoryId: 'opinions', catalan: 'Sembla una persona molt honesta.', english: 'He seems a very honest person.', targetWords: ['semblar'] },
  { id: 'u15-11', categoryId: 'opinions', catalan: 'Espero que tot vagi bé.', english: 'I hope everything goes well.', targetWords: ['esperar'] },
  { id: 'u15-12', categoryId: 'opinions', catalan: 'Sembla que plourà demà.', english: 'It seems it will rain tomorrow.', targetWords: ['sembla que'] },
  { id: 'u15-13', categoryId: 'opinions', catalan: 'M’agradaria venir, però tinc feina.', english: 'I would like to come, however I have work.', targetWords: ['però'] },
  { id: 'u15-14', categoryId: 'opinions', catalan: 'De totes maneres, gràcies per l’oferta.', english: 'Anyway, thank you for the offer.', targetWords: ['de totes maneres'] },
  { id: 'u15-15', categoryId: 'opinions', catalan: 'Això és exactament el que volia dir.', english: 'That is exactly what I meant.', targetWords: ['exactament'] },
  { id: 'u15-16', categoryId: 'opinions', catalan: 'Estic absolutament d’acord.', english: 'I absolutely agree.', targetWords: ['absolutament'] },
  { id: 'u15-17', categoryId: 'opinions', catalan: 'Canviem de tema, sisplau.', english: 'Let us change the subject, please.', targetWords: ['tema'] },
  { id: 'u15-18', categoryId: 'opinions', catalan: 'Va ser una conversa molt llarga.', english: 'It was a very long conversation.', targetWords: ['conversa'] },

  // ---------------------------------------------------------------- Unit 16
  { id: 'u16-1', categoryId: 'past-events', catalan: 'Ahir vaig anar al cinema.', english: 'Yesterday I went to the cinema.', targetWords: ['ahir', 'vaig anar'], grammarConcepts: ['preterite'] },
  { id: 'u16-2', categoryId: 'past-events', catalan: 'La setmana passada vaig ser a París.', english: 'Last week I was in Paris.', targetWords: ['la setmana passada'], grammarConcepts: ['preterite'] },
  { id: 'u16-3', categoryId: 'past-events', catalan: 'El mes passat vam canviar de feina.', english: 'Last month we changed jobs.', targetWords: ['el mes passat'], grammarConcepts: ['preterite'] },
  { id: 'u16-4', categoryId: 'past-events', catalan: 'Vaig fer un pastís per al seu aniversari.', english: 'I made a cake for her birthday.', targetWords: ['vaig fer'], grammarConcepts: ['preterite'] },
  { id: 'u16-5', categoryId: 'past-events', catalan: 'Vaig veure la teva germana al mercat.', english: 'I saw your sister at the market.', targetWords: ['vaig veure'], grammarConcepts: ['preterite'] },
  { id: 'u16-6', categoryId: 'past-events', catalan: 'Vaig menjar massa a la festa.', english: 'I ate too much at the party.', targetWords: ['vaig menjar'], grammarConcepts: ['preterite'] },
  { id: 'u16-7', categoryId: 'past-events', catalan: 'Vaig ser professor durant deu anys.', english: 'I was a teacher for ten years.', targetWords: ['vaig ser'], grammarConcepts: ['preterite', 'ser-vs-estar'] },
  { id: 'u16-8', categoryId: 'past-events', catalan: 'Vaig estar malalt tota la setmana.', english: 'I was ill all week.', targetWords: ['vaig estar'], grammarConcepts: ['preterite', 'ser-vs-estar'] },
  { id: 'u16-9', categoryId: 'past-events', catalan: 'Vaig arribar fa dues hores.', english: 'I arrived two hours ago.', targetWords: ['fa', 'vaig arribar'] },
  { id: 'u16-10', categoryId: 'past-events', catalan: 'Durant l’estiu vam viatjar molt.', english: 'During the summer we travelled a lot.', targetWords: ['durant'] },
  { id: 'u16-11', categoryId: 'past-events', catalan: 'Llavors vam decidir tornar a casa.', english: 'Then we decided to go home.', targetWords: ['llavors'] },
  { id: 'u16-12', categoryId: 'past-events', catalan: 'Li vaig dir la veritat.', english: 'I told him the truth.', targetWords: ['vaig dir'], grammarConcepts: ['preterite'] },
  { id: 'u16-13', categoryId: 'past-events', catalan: 'Vaig comprar el bitllet per internet.', english: 'I bought the ticket online.', targetWords: ['vaig comprar'], grammarConcepts: ['preterite'] },
  { id: 'u16-14', categoryId: 'past-events', catalan: 'Vaig escriure un correu molt llarg.', english: 'I wrote a very long email.', targetWords: ['vaig escriure'], grammarConcepts: ['preterite'] },
  { id: 'u16-15', categoryId: 'past-events', catalan: 'Vaig llegir aquesta novel·la l’any passat.', english: 'I read this novel last year.', targetWords: ['vaig llegir'], grammarConcepts: ['preterite'] },
  { id: 'u16-16', categoryId: 'past-events', catalan: 'Vaig marxar abans que acabés.', english: 'I left before it finished.', targetWords: ['vaig marxar'], grammarConcepts: ['preterite'] },
  { id: 'u16-17', categoryId: 'past-events', catalan: 'En aquells dies no hi havia mòbils.', english: 'In those days there were no mobile phones.', targetWords: ['en aquells dies'] },
  { id: 'u16-18', categoryId: 'past-events', catalan: 'Hi havia una vegada un rei molt savi.', english: 'Once upon a time there was a very wise king.', targetWords: ['hi havia una vegada'] },
  { id: 'u16-19', categoryId: 'past-events', catalan: 'De sobte va començar a ploure.', english: 'Suddenly it started to rain.', targetWords: ['de sobte'] },
  { id: 'u16-20', categoryId: 'past-events', catalan: 'Finalment vam trobar l’hotel.', english: 'Finally we found the hotel.', targetWords: ['finalment'] },

  // ---------------------------------------------------------------- Unit 17
  { id: 'u17-1', categoryId: 'weather', catalan: 'Quin temps fa avui?', english: 'What is the weather like today?', targetWords: ['temps'] },
  { id: 'u17-2', categoryId: 'weather', catalan: 'El sol és molt fort al migdia.', english: 'The sun is very strong at midday.', targetWords: ['sol'] },
  { id: 'u17-3', categoryId: 'weather', catalan: 'La pluja no ha parat en tot el dia.', english: 'The rain has not stopped all day.', targetWords: ['pluja'] },
  { id: 'u17-4', categoryId: 'weather', catalan: 'Avui fa molt de vent.', english: 'It is very windy today.', targetWords: ['vent'] },
  { id: 'u17-5', categoryId: 'weather', catalan: 'No hi ha ni un núvol al cel.', english: 'There is not a single cloud in the sky.', targetWords: ['núvol'] },
  { id: 'u17-6', categoryId: 'weather', catalan: 'A l’agost fa calor a Barcelona.', english: 'In August it is hot in Barcelona.', targetWords: ['fa calor'] },
  { id: 'u17-7', categoryId: 'weather', catalan: 'Al gener fa fred a la muntanya.', english: 'In January it is cold in the mountains.', targetWords: ['fa fred'] },
  { id: 'u17-8', categoryId: 'weather', catalan: 'Avui fa sol i no fa gens de vent.', english: 'Today it is sunny and not windy at all.', targetWords: ['fa sol'] },
  { id: 'u17-9', categoryId: 'weather', catalan: 'Plou des de primera hora.', english: 'It has been raining since early on.', targetWords: ['plou'] },
  { id: 'u17-10', categoryId: 'future-plans', catalan: 'Demà aniré a la platja.', english: 'Tomorrow I will go to the beach.', targetWords: ['demà', 'aniré'], grammarConcepts: ['future-tense'] },
  { id: 'u17-11', categoryId: 'future-plans', catalan: 'Faré els deures aquesta nit.', english: 'I will do my homework tonight.', targetWords: ['faré'], grammarConcepts: ['future-tense'] },
  { id: 'u17-12', categoryId: 'weather', catalan: 'Quina estació t’agrada més?', english: 'Which season do you like best?', targetWords: ['estació'] },
  { id: 'u17-13', categoryId: 'weather', catalan: 'A l’estiu anem sempre al mar.', english: 'In summer we always go to the sea.', targetWords: ['estiu'] },
  { id: 'u17-14', categoryId: 'weather', catalan: 'L’hivern aquí és bastant suau.', english: 'The winter here is quite mild.', targetWords: ['hivern'] },
  { id: 'u17-15', categoryId: 'weather', catalan: 'A la primavera floreixen els ametllers.', english: 'In spring the almond trees blossom.', targetWords: ['primavera'] },
  { id: 'u17-16', categoryId: 'weather', catalan: 'La tardor és la meva estació preferida.', english: 'Autumn is my favourite season.', targetWords: ['tardor'] },
  { id: 'u17-17', categoryId: 'weather', catalan: 'Al Pirineu neva molt.', english: 'It snows a lot in the Pyrenees.', targetWords: ['neva'] },
  { id: 'u17-18', categoryId: 'weather', catalan: 'La neu cobria tot el poble.', english: 'The snow covered the whole village.', targetWords: ['neu'] },
  { id: 'u17-19', categoryId: 'weather', catalan: 'Ahir a la nit va haver-hi una tempesta.', english: 'Last night there was a storm.', targetWords: ['tempesta'] },
  { id: 'u17-20', categoryId: 'weather', catalan: 'Al matí hi ha molta boira.', english: 'In the morning there is a lot of fog.', targetWords: ['boira'] },
  { id: 'u17-21', categoryId: 'future-plans', catalan: 'Seré a casa a les vuit.', english: 'I will be at home at eight.', targetWords: ['seré'], grammarConcepts: ['future-tense'] },
  { id: 'u17-22', categoryId: 'future-plans', catalan: 'Estaré fora tota la setmana.', english: 'I will be away all week.', targetWords: ['estaré'], grammarConcepts: ['future-tense'] },
  { id: 'u17-23', categoryId: 'future-plans', catalan: 'Tindré temps dissabte al matí.', english: 'I will have time on Saturday morning.', targetWords: ['tindré'], grammarConcepts: ['future-tense'] },
  { id: 'u17-24', categoryId: 'future-plans', catalan: 'Vindré a buscar-te a les set.', english: 'I will come to pick you up at seven.', targetWords: ['vindré'], grammarConcepts: ['future-tense'] },
  { id: 'u17-25', categoryId: 'future-plans', catalan: 'La setmana que ve començo un curs.', english: 'Next week I am starting a course.', targetWords: ['la setmana que ve'] },
  { id: 'u17-26', categoryId: 'future-plans', catalan: 'En el futur vull viure vora el mar.', english: 'In the future I want to live by the sea.', targetWords: ['en el futur'] },

  // ---------------------------------------------------------------- Unit 18
  { id: 'u18-1', categoryId: 'tourism', catalan: 'Necessito informació sobre els horaris.', english: 'I need information about the timetables.', targetWords: ['informació'] },
  { id: 'u18-2', categoryId: 'tourism', catalan: 'Podria ajudar-me, sisplau?', english: 'Could you help me, please?', targetWords: ['podria'] },
  { id: 'u18-3', categoryId: 'tourism', catalan: 'Necessito ajuda amb les maletes.', english: 'I need help with the suitcases.', targetWords: ['ajuda'] },
  { id: 'u18-4', categoryId: 'tourism', catalan: 'Em pots ajudar un moment?', english: 'Can you help me for a moment?', targetWords: ['ajudar'] },
  { id: 'u18-5', categoryId: 'tourism', catalan: 'Treballo en una oficina al centre.', english: 'I work in an office in the centre.', targetWords: ['oficina'] },
  { id: 'u18-6', categoryId: 'tourism', catalan: 'L’oficina de turisme és a la plaça.', english: 'The tourist office is on the square.', targetWords: ['oficina de turisme'] },
  { id: 'u18-7', categoryId: 'tourism', catalan: 'Té un mapa de la ciutat?', english: 'Do you have a map of the city?', targetWords: ['mapa'] },
  { id: 'u18-8', categoryId: 'tourism', catalan: 'La guia parlava molt bé l’anglès.', english: 'The guide spoke English very well.', targetWords: ['guia'] },
  { id: 'u18-9', categoryId: 'tourism', catalan: 'El museu és obert fins a les vuit.', english: 'The museum is open until eight.', targetWords: ['obert'] },
  { id: 'u18-10', categoryId: 'tourism', catalan: 'La botiga està tancada els diumenges.', english: 'The shop is closed on Sundays.', targetWords: ['tancada'] },
  { id: 'u18-11', categoryId: 'tourism', catalan: 'L’entrada és gratuïta els diumenges.', english: 'Entry is free on Sundays.', targetWords: ['gratuïta', 'entrada'] },
  { id: 'u18-12', categoryId: 'tourism', catalan: 'No hi ha cap taula disponible.', english: 'There is no table available.', targetWords: ['disponible'] },
  { id: 'u18-13', categoryId: 'tourism', catalan: 'És necessari reservar amb antelació.', english: 'It is necessary to book in advance.', targetWords: ['necessari', 'reservar'] },
  { id: 'u18-14', categoryId: 'tourism', catalan: 'Tinc una reserva a nom de Puig.', english: 'I have a reservation under the name Puig.', targetWords: ['reserva'] },
  { id: 'u18-15', categoryId: 'tourism', catalan: 'La sortida és per aquella porta.', english: 'The exit is through that door.', targetWords: ['sortida'] },
  { id: 'u18-16', categoryId: 'tourism', catalan: 'Fan descompte als estudiants.', english: 'They give a discount to students.', targetWords: ['descompte'] },
  { id: 'u18-17', categoryId: 'tourism', catalan: 'L’esmorzar està inclòs en el preu.', english: 'Breakfast is included in the price.', targetWords: ['inclòs'] },

  // ---------------------------------------------------------------- Unit 19
  { id: 'u19-1', categoryId: 'transport', catalan: 'El tren de Girona surt a les deu.', english: 'The train to Girona leaves at ten.', targetWords: ['tren'] },
  { id: 'u19-2', categoryId: 'transport', catalan: 'Agafo l’autobús cada matí.', english: 'I take the bus every morning.', targetWords: ['autobús'] },
  { id: 'u19-3', categoryId: 'transport', catalan: 'El metro és més ràpid que el cotxe.', english: 'The metro is faster than the car.', targetWords: ['metro'] },
  { id: 'u19-4', categoryId: 'transport', catalan: 'Hem agafat un taxi fins a l’hotel.', english: 'We took a taxi to the hotel.', targetWords: ['taxi'] },
  { id: 'u19-5', categoryId: 'transport', catalan: 'Ens trobem a l’estació de Sants.', english: 'We are meeting at Sants station.', targetWords: ['estació'] },
  { id: 'u19-6', categoryId: 'transport', catalan: 'La parada és just aquí davant.', english: 'The stop is right in front here.', targetWords: ['parada'] },
  { id: 'u19-7', categoryId: 'transport', catalan: 'He comprat el bitllet a la màquina.', english: 'I bought the ticket at the machine.', targetWords: ['bitllet'] },
  { id: 'u19-8', categoryId: 'transport', catalan: 'El tren surt de l’andana tres.', english: 'The train leaves from platform three.', targetWords: ['andana'] },
  { id: 'u19-9', categoryId: 'transport', catalan: 'Hem de pujar al vagó del davant.', english: 'We have to get on the front carriage.', targetWords: ['pujar'] },
  { id: 'u19-10', categoryId: 'transport', catalan: 'Has de baixar a la propera parada.', english: 'You have to get off at the next stop.', targetWords: ['baixar'] },
  { id: 'u19-11', categoryId: 'transport', catalan: 'El tramvia passa cada deu minuts.', english: 'The tram comes every ten minutes.', targetWords: ['tramvia'] },
  { id: 'u19-12', categoryId: 'transport', catalan: 'L’avió aterra a les sis.', english: 'The plane lands at six.', targetWords: ['avió'] },
  { id: 'u19-13', categoryId: 'transport', catalan: 'L’aeroport és lluny del centre.', english: 'The airport is far from the centre.', targetWords: ['aeroport'] },
  { id: 'u19-14', categoryId: 'transport', catalan: 'El tren porta mitja hora de retard.', english: 'The train is half an hour late.', targetWords: ['retard'] },
  { id: 'u19-15', categoryId: 'transport', catalan: 'L’autobús sempre és puntual.', english: 'The bus is always on time.', targetWords: ['puntual'] },
  { id: 'u19-16', categoryId: 'transport', catalan: 'He perdut la connexió a València.', english: 'I missed the connection in Valencia.', targetWords: ['connexió'] },
  { id: 'u19-17', categoryId: 'transport', catalan: 'Porto massa equipatge.', english: 'I am carrying too much luggage.', targetWords: ['equipatge'] },
  { id: 'u19-18', categoryId: 'transport', catalan: 'Aquest seient està ocupat.', english: 'This seat is taken.', targetWords: ['seient'] },
  { id: 'u19-19', categoryId: 'transport', catalan: 'Prefereixo seure vora la finestra.', english: 'I prefer to sit by the window.', targetWords: ['finestra'] },
  { id: 'u19-20', categoryId: 'transport', catalan: 'El meu seient és al passadís.', english: 'My seat is on the aisle.', targetWords: ['passadís'] },

  // ---------------------------------------------------------------- Unit 20
  { id: 'u20-1', categoryId: 'celebrations', catalan: 'La festa major és al setembre.', english: 'The town festival is in September.', targetWords: ['festa'] },
  { id: 'u20-2', categoryId: 'celebrations', catalan: 'Hi haurà una gran celebració a la plaça.', english: 'There will be a big celebration in the square.', targetWords: ['celebració'] },
  { id: 'u20-3', categoryId: 'celebrations', catalan: 'És una tradició molt antiga.', english: 'It is a very old tradition.', targetWords: ['tradició'] },
  { id: 'u20-4', categoryId: 'celebrations', catalan: 'M’agrada molt la música catalana.', english: 'I really like Catalan music.', targetWords: ['música'] },
  { id: 'u20-5', categoryId: 'celebrations', catalan: 'El ball va durar fins a la matinada.', english: 'The dance lasted until dawn.', targetWords: ['ball'] },
  { id: 'u20-6', categoryId: 'celebrations', catalan: 'Sap ballar molt bé la sardana.', english: 'She can dance the sardana very well.', targetWords: ['ballar', 'sardana'] },
  { id: 'u20-7', categoryId: 'celebrations', catalan: 'Anem a celebrar el teu aniversari.', english: 'Let us celebrate your birthday.', targetWords: ['celebrar'] },
  { id: 'u20-8', categoryId: 'celebrations', catalan: 'Espero que gaudiu de la festa.', english: 'I hope you enjoy the party.', targetWords: ['gaudir'] },
  { id: 'u20-9', categoryId: 'celebrations', catalan: 'Els focs artificials comencen a mitjanit.', english: 'The fireworks start at midnight.', targetWords: ['focs artificials'] },
  { id: 'u20-10', categoryId: 'celebrations', catalan: 'Els castellers van aixecar un castell de nou pisos.', english: 'The castellers raised a nine-storey human tower.', targetWords: ['castell'] },
  { id: 'u20-11', categoryId: 'celebrations', catalan: 'Felicitats per la teva feina!', english: 'Congratulations on your work!', targetWords: ['felicitats'] },
  { id: 'u20-12', categoryId: 'celebrations', catalan: 'Per molts anys, iaia!', english: 'Happy birthday, Grandma!', targetWords: ['per molts anys'] },
  { id: 'u20-13', categoryId: 'celebrations', catalan: 'Bon Nadal i bones festes!', english: 'Merry Christmas and happy holidays!', targetWords: ['bon nadal'] },
  { id: 'u20-14', categoryId: 'celebrations', catalan: 'Bon any nou a tothom!', english: 'Happy New Year everyone!', targetWords: ['bon any nou'] },
  { id: 'u20-15', categoryId: 'celebrations', catalan: 'Per Pasqua mengem la mona.', english: 'At Easter we eat the mona cake.', targetWords: ['pasqua'] },
  { id: 'u20-16', categoryId: 'celebrations', catalan: 'Per Sant Jordi es regalen llibres i roses.', english: 'On Saint George’s Day people give books and roses.', targetWords: ['sant jordi'] },
  { id: 'u20-17', categoryId: 'celebrations', catalan: 'La llegenda parla d’un drac i un cavaller.', english: 'The legend speaks of a dragon and a knight.', targetWords: ['llegenda', 'drac', 'cavaller'] },
  { id: 'u20-18', categoryId: 'celebrations', catalan: 'Ahir ens ho vam passar molt bé.', english: 'We had a great time yesterday.', targetWords: ['passar-s-ho bé'] },
  { id: 'u20-19', categoryId: 'celebrations', catalan: 'Anem a brindar pels nuvis!', english: 'Let us toast the newlyweds!', targetWords: ['brindar'] },
  { id: 'u20-20', categoryId: 'celebrations', catalan: 'Salut! Per molts anys!', english: 'Cheers! Many happy returns!', targetWords: ['salut'] },

  // ------------------------------------------------- Remaining course phrases
  { id: 'x-1', categoryId: 'greetings', catalan: 'Gràcies! — De res, home.', english: "Thanks! — You're welcome.", targetWords: ['de res'] },
  { id: 'x-2', categoryId: 'family', catalan: 'Tinc trenta-dos anys.', english: 'I am thirty-two years old.', targetWords: ['tinc ... anys'] },
  { id: 'x-3', categoryId: 'numbers', catalan: 'Quin és el teu telèfon? Te l’apunto.', english: 'What is your phone number? I will write it down.', targetWords: ['quin és el teu telèfon'] },
  { id: 'x-4', categoryId: 'opinions', catalan: 'M’encanta la música en directe.', english: 'I love live music.', targetWords: ["m'encanta"] },
  { id: 'x-5', categoryId: 'opinions', catalan: 'Estic d’acord amb tu.', english: 'I agree with you.', targetWords: ["estic d'acord"] },
  { id: 'x-6', categoryId: 'opinions', catalan: 'Doncs jo no estic d’acord.', english: 'Well, I disagree.', targetWords: ["no estic d'acord"] },
  { id: 'x-7', categoryId: 'opinions', catalan: 'D’altra banda, també és més car.', english: 'On the other hand, it is also more expensive.', targetWords: ["d'altra banda"] },
  { id: 'x-8', categoryId: 'transport', catalan: 'Un bitllet d’anada i tornada, sisplau.', english: 'A return ticket, please.', targetWords: ["d'anada i tornada"] },
];

export const UNIT_SENTENCES: SentenceData[] = AUTHORED.map(withIndices);

/* ============================================================
   CPCS 222 — Discrete Mathematics
   json_loader.js  —  Data store + merge engine
   All 4 JSON layers embedded inline (file:// compatible).
   ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     EMBEDDED COURSE DATA
     Merges: core_content + visual_layer + assessment_layer + math_layer
  ---------------------------------------------------------- */
  var _META = {
    course:        'CPCS 222 — Discrete Mathematics',
    chapter:       1,
    chapter_title: 'The Foundations: Logic and Proofs',
    lesson_count:  8
  };

  var _LESSONS = {

    /* ========================================================
       SECTION 1.1 — Propositional Logic
    ======================================================== */
    '1.1': {
      lesson_id: 'ch1.s1.1',
      section:   '1.1',
      title:     'Propositional Logic — Statements, Connectives, and Truth Tables',
      objective: 'Decide whether a sentence is a proposition, build compound propositions using the five core connectives (¬, ∧, ∨, →, ↔) and the auxiliary ⊕, and construct a truth table for any compound proposition with up to three propositional variables.',
      why:       'Propositional logic is the alphabet of formal reasoning. Hardware designers use it to lay out circuits, programmers use it inside every if-statement and SQL WHERE clause, and mathematicians use it to state theorems precisely. Once you can manipulate truth values mechanically, you stop guessing about whether an argument is sound and start proving it.',

      story: `Layla (student): "Professor, my friend says 'x + 1 = 2' is a proposition. I disagree. Who's right?"

Professor Hadi: "You are. A proposition must be a declarative sentence that is definitely either true or false. 'x + 1 = 2' depends on x — it's an open sentence, not yet a proposition. The moment we plug in a value, say x = 1, it becomes the proposition '1 + 1 = 2', which is true."

Layla: "So commands and questions don't count?"

Professor Hadi: "Right. 'Close the door!' is a command, 'What time is it?' is a question. Neither is true or false. Now — what truth value does 'The Moon is made of green cheese' have?"

Layla: "False — but it's still a proposition, because it CAN be evaluated."

Professor Hadi: "Exactly. Truth value, not truthfulness, is what matters."`,

      explain: `A PROPOSITION is a declarative sentence that is either true (T) or false (F), but not both. We name simple propositions with letters p, q, r, s. From these atomic propositions we build COMPOUND PROPOSITIONS using logical connectives. There are five connectives you must master.

1) NEGATION (¬p, read 'not p') flips the truth value: ¬T = F, ¬F = T.

2) CONJUNCTION (p ∧ q, 'p and q') is true only when both p and q are true.

3) DISJUNCTION (p ∨ q, 'p or q') is true when at least one of p, q is true. This is the INCLUSIVE 'or' of mathematics. English's exclusive 'or' is a separate connective ⊕ (XOR), which is true exactly when p and q differ.

4) IMPLICATION (p → q, 'if p then q') is the trickiest. It is FALSE only in one case: when the hypothesis p is true and the conclusion q is false. If p is false, p → q is vacuously true regardless of q. Think of it as a promise: only a kept promise that fails counts as a lie.

5) BICONDITIONAL (p ↔ q, 'p if and only if q') is true when p and q have the same truth value.

From p → q we form three related conditionals:
• CONVERSE: q → p
• CONTRAPOSITIVE: ¬q → ¬p  (logically equivalent to p → q)
• INVERSE: ¬p → ¬q  (equivalent to the converse, NOT to the original)

A TRUTH TABLE lists every possible combination of truth values for the atomic propositions and computes the truth value of the compound. With n atomic variables you get 2ⁿ rows. Build truth tables column by column, from the innermost subexpressions outward.

Operator precedence (highest to lowest): ¬, then ∧, then ∨, then →, then ↔. When in doubt, parenthesize.`,

      key_points: [
        'A proposition is a declarative sentence with a definite truth value (T or F).',
        'Open sentences with free variables (like "x > 5") are NOT propositions until variables are bound or assigned.',
        'Five core connectives: ¬ (not), ∧ (and), ∨ (or, inclusive), → (if-then), ↔ (iff).',
        'p → q is false ONLY when p is true and q is false; otherwise true.',
        'p → q ≡ ¬q → ¬p (contrapositive), but p → q ≢ q → p (converse).',
        'A compound proposition over n atomic variables has 2ⁿ rows in its truth table.',
        'Precedence: ¬ > ∧ > ∨ > → > ↔; parentheses override.'
      ],

      examples: [
        {
          prompt: `Which of these are propositions, and what is the truth value of each?
(a) "Cairo is the capital of Egypt."
(b) "5 + 7 = 10."
(c) "x + 2 = 11."
(d) "Answer this question."`,
          answer: `(a) Proposition, TRUE.
(b) Proposition, FALSE.
(c) Open sentence — depends on x — NOT a proposition.
(d) Imperative — NOT a proposition.`
        },
        {
          prompt: `Let p = "It is below freezing" and q = "It is snowing".
Translate: "It is below freezing but not snowing."`,
          answer: `p ∧ ¬q
The English word "but" is logically the same as "and" — it just signals contrast.`
        },
        {
          prompt: `Construct the truth table for (p ∨ ¬q) → q.`,
          answer: `p  | q  | ¬q | p ∨ ¬q | (p ∨ ¬q) → q
T  | T  |  F |   T    |      T
T  | F  |  T |   T    |      F
F  | T  |  F |   F    |      T
F  | F  |  T |   T    |      F`
        },
        {
          prompt: `State the converse, contrapositive, and inverse of:
"If it snows tonight, then I will stay home."`,
          answer: `Let p = "it snows tonight", q = "I stay home". Original: p → q.

Converse (q → p): "If I stay home tonight, then it snowed."
Contrapositive (¬q → ¬p): "If I do not stay home, then it did not snow."
Inverse (¬p → ¬q): "If it does not snow, then I will not stay home."`
        },
        {
          prompt: `How many rows does the truth table for (p → r) ∨ (¬s → ¬t) ∨ (¬u → v) have?`,
          answer: `Six distinct variables (p, r, s, t, u, v), so 2⁶ = 64 rows.`
        }
      ],

      quiz: [
        {
          q: 'Which of the following is a proposition?\n(i) "7 is prime."  (ii) "Open the window."  (iii) "x² ≥ 0."  (iv) "Are you ready?"',
          choices: ['i only', 'i and iii', 'ii and iv', 'all four'],
          answer: 'i only',
          explanation: '(i) is true — a definite truth value. (ii) is a command. (iii) has free variable x — open sentence. (iv) is a question.'
        },
        {
          q: 'p → q is FALSE in exactly which case?',
          choices: ['p T, q T', 'p T, q F', 'p F, q T', 'p F, q F'],
          answer: 'p T, q F',
          explanation: 'An implication only fails when its hypothesis holds but the conclusion does not.'
        },
        {
          q: 'Which is the contrapositive of "If it rains, the match is cancelled"?',
          choices: [
            'If the match is cancelled, it rained.',
            'If the match is not cancelled, it did not rain.',
            'If it does not rain, the match is not cancelled.',
            'If the match is cancelled, it did not rain.'
          ],
          answer: 'If the match is not cancelled, it did not rain.',
          explanation: 'Contrapositive of p → q is ¬q → ¬p; swap and negate both sides.'
        },
        {
          q: 'How many rows are in a truth table with 4 atomic variables?',
          choices: ['8', '12', '16', '24'],
          answer: '16',
          explanation: '2⁴ = 16.'
        },
        {
          q: 'Translate to logic: "You can edit the entry only if you are an administrator." (e = can edit, a = is admin.)',
          choices: ['a → e', 'e → a', 'e ∧ a', 'e ↔ a'],
          answer: 'e → a',
          explanation: '"P only if Q" means P → Q. Editing requires admin status, not the other way around.'
        }
      ],

      math: [
        'p → q  ≡  ¬p ∨ q',
        'p ↔ q  ≡  (p → q) ∧ (q → p)',
        'p ⊕ q  ≡  (p ∨ q) ∧ ¬(p ∧ q)',
        'Truth-table size for n variables: 2ⁿ rows.'
      ],

      visual: {
        type: 'table',
        idea: 'An interactive Truth Table Builder — toggle any formula and watch every column populate row by row. T rows are green, F rows are red. Includes all five connectives plus XOR.',
        interactive_hint: 'Select a formula from the tabs above the table to see its complete truth table with color-coded cells.'
      }
    },

    /* ========================================================
       SECTION 1.2 — Applications of Propositional Logic
    ======================================================== */
    '1.2': {
      lesson_id: 'ch1.s1.2',
      section:   '1.2',
      title:     'Applications of Propositional Logic — Translation, Specifications, and Puzzles',
      objective: 'Translate English sentences into propositional logic, judge whether a set of system specifications is consistent, decide satisfiability, and solve logic puzzles by case analysis on truth values.',
      why:       'Real software bugs hide in misread specifications. A requirements document that LOOKS clear can be inconsistent — provably impossible to satisfy — and propositional logic is the tool that catches it before code is written.',

      story: `Khalid (student): "My intern team got a spec that said: 'The reply is sent unless the file system is full,' AND 'The reply is not sent.' We spent two days arguing whether the file system has to be full."

Professor Hadi: "Translate them. Let r = 'reply is sent', f = 'file system is full'. 'Reply sent unless full' becomes ¬f → r — equivalently r ∨ f. Combined with ¬r, what does logic force?"

Khalid: "r ∨ f and ¬r both true... so f must be true. The file system MUST be full."

Professor Hadi: "You just resolved a two-day argument with one truth table. That's the value of formalization."`,

      explain: `TRANSLATING ENGLISH TO LOGIC requires two steps:
  (1) Identify the atomic propositions and assign letters.
  (2) Map English connectives to logical ones — paying close attention to phrases that mean implication.

Watch for these patterns, all of which mean p → q:
  • "if p, then q"           • "p implies q"
  • "p only if q"             • "q if p"
  • "q whenever p"            • "p is sufficient for q"
  • "q is necessary for p"    • "q follows from p"

And patterns meaning p ↔ q: "p iff q", "p is necessary and sufficient for q".

SYSTEM SPECIFICATIONS are lists of propositions that describe required behavior. A spec list is CONSISTENT if there is at least one assignment of truth values to its atomic variables that makes every proposition true simultaneously. Otherwise it is INCONSISTENT.

SATISFIABILITY of a single compound proposition: satisfiable if some assignment makes it true. If every row is true it is a TAUTOLOGY; if every row is false it is a CONTRADICTION; otherwise it is a CONTINGENCY.

LOGIC PUZZLES — like Smullyan's knights-and-knaves — are solved by letting propositional letters stand for "X is a knight", encoding each speaker's statement, and trying both truth values for the speaker. Knights tell truth; knaves lie. Any consistent row is a solution.`,

      key_points: [
        '"p only if q" translates to p → q (NOT q → p).',
        '"p whenever q" translates to q → p — the "when" clause is the hypothesis.',
        '"Necessary" marks the conclusion of an implication; "sufficient" marks the hypothesis.',
        'A spec list is consistent ⇔ there exists a row in the joint truth table where every spec is T.',
        'Satisfiable: some row T. Tautology: every row T. Contradiction: every row F.',
        'In knight/knave puzzles, encode "X is a knight" as a single atomic proposition; truth-tellers\' statements equal their type, liars\' are negated.'
      ],

      examples: [
        {
          prompt: `Translate: "You can access the Internet from campus only if you are a CS major or you are not a freshman."
(a = access, c = CS major, f = freshman.)`,
          answer: `a → (c ∨ ¬f)
"Only if" makes the right-hand side a NECESSARY condition for a.`
        },
        {
          prompt: `Are these specs consistent?
S1: "The diagnostic message is stored in the buffer or it is retransmitted."
S2: "The message is not stored in the buffer."
S3: "If the message is stored, then it is retransmitted."`,
          answer: `Let p = stored, q = retransmitted.
Specs: p ∨ q, ¬p, p → q.
Try p = F, q = T: p ∨ q = T, ¬p = T, p → q = T (vacuously). CONSISTENT.`
        },
        {
          prompt: `Use De Morgan's law to negate: "Carlos will bicycle or run tomorrow."`,
          answer: `¬(b ∨ r) ≡ ¬b ∧ ¬r
"Carlos will not bicycle AND will not run tomorrow."`
        },
        {
          prompt: `Knights-and-Knaves: A says "B is a knight". B says "A and I are of opposite types". Who is who?`,
          answer: `Let p = "A is knight", q = "B is knight".
A's claim: q. If A is a knight then q is true.
B's claim: p ⊕ q must be true. But p = T, q = T → p ⊕ q = F. Contradiction.
So A is a KNAVE (¬p) → A's claim is false → ¬q. BOTH ARE KNAVES.`
        },
        {
          prompt: `Is (p → q) ∧ (p → ¬q) ∧ (¬p → q) ∧ (¬p → ¬q) satisfiable?`,
          answer: `No. p → q and p → ¬q together require ¬p; ¬p → q and ¬p → ¬q together require p.
No row satisfies all four — UNSATISFIABLE (a contradiction).`
        }
      ],

      quiz: [
        {
          q: '"You will pass only if you study." Which is the correct translation? (s = study, p = pass.)',
          choices: ['s → p', 'p → s', 's ↔ p', '¬s → p'],
          answer: 'p → s',
          explanation: '"p only if s" means p → s; studying is necessary for passing.'
        },
        {
          q: '"p unless q" is the same as:',
          choices: ['p → q', '¬q → p', 'q → p', 'p ∧ ¬q'],
          answer: '¬q → p',
          explanation: '"p unless q" = "if not q, then p" = ¬q → p (equivalently p ∨ q).'
        },
        {
          q: 'A spec list contains p, ¬p ∨ q, ¬q. Is it consistent?',
          choices: ['Yes', 'No, p and ¬q force q', 'No, ¬p ∨ q with p forces q, contradicting ¬q', 'Cannot tell'],
          answer: 'No, ¬p ∨ q with p forces q, contradicting ¬q',
          explanation: 'p is T, so for ¬p ∨ q to hold q must be T. But ¬q forces q F. Inconsistent.'
        },
        {
          q: 'A proposition that is true under at least one assignment is called:',
          choices: ['Tautology', 'Contradiction', 'Satisfiable', 'Contingent'],
          answer: 'Satisfiable',
          explanation: 'Satisfiable = at least one true row. Tautologies and contingencies are special satisfiable cases.'
        },
        {
          q: 'On Smullyan\'s island, A says "I am a knave." What is A?',
          choices: ['A knight', 'A knave', 'Either is possible', 'Impossible — A cannot exist'],
          answer: 'Impossible — A cannot exist',
          explanation: 'If A is a knight the statement is true so A is a knave — contradiction. If A is a knave the statement is true but knaves only lie — contradiction. The Liar\'s paradox.'
        }
      ],

      math: [
        'Consistent(S₁,…,Sₙ) ⇔ ∃ assignment ν such that ν(Sᵢ) = T for every i.',
        'Tautology ⇔ all rows T.  Contradiction ⇔ all rows F.  Contingency ⇔ at least one of each.',
        'p ⊕ q ≡ (p ∧ ¬q) ∨ (¬p ∧ q).'
      ],

      visual: {
        type: 'logic-flow',
        idea: 'An English-to-logic translator panel: highlight trigger phrases (only if, whenever, unless, necessary, sufficient) and show the matching connective. Below, a live consistency checker builds the joint truth table.',
        interactive_hint: 'Toggle each variable; the satisfying-row highlight moves in real time so you feel what "consistent" means.'
      }
    },

    /* ========================================================
       SECTION 1.3 — Propositional Equivalences
    ======================================================== */
    '1.3': {
      lesson_id: 'ch1.s1.3',
      section:   '1.3',
      title:     'Propositional Equivalences — Laws of Logic and Symbolic Manipulation',
      objective: 'Recognize the standard logical equivalences (De Morgan\'s, distributive, absorption, etc.), prove two propositions equivalent both by truth table and by symbolic derivation, and use laws to simplify formulas.',
      why:       'Logical equivalences do for reasoning what algebra does for arithmetic: they let you rewrite a tangled formula into a simpler one without rebuilding a truth table. Compiler optimizers, SAT solvers, and circuit minimizers all run on these laws.',

      story: `Sara: "Professor, my code has the condition !(a && b) || (a && b). VS Code says it's always true. Why?"

Professor Hadi: "Let p = a∧b. The expression is ¬p ∨ p — that's the law of the excluded middle. Always true, regardless of p."

Sara: "So I could replace the whole condition with true?"

Professor Hadi: "Yes — and a modern compiler would. But knowing WHY it can do that is what we're learning. We proved it through identity laws, not by simulation."

Sara: "What if the code is (p ∧ q) ∨ (p ∧ ¬q)?"

Professor Hadi: "Distribute: p ∧ (q ∨ ¬q) = p ∧ T = p. The q dropped out completely. That's a real optimization."`,

      explain: `Two propositions P and Q are LOGICALLY EQUIVALENT, written P ≡ Q, if they have the same truth value under every assignment. Equivalently, P ↔ Q is a tautology.

There are two ways to prove P ≡ Q:
  (A) TRUTH TABLE: build columns for P and Q; check they match in every row.
  (B) SYMBOLIC DERIVATION: rewrite P using a chain of standard equivalences until you arrive at Q. Each step cites a named law.

The standard laws (memorize these):

  Identity:        p ∧ T ≡ p,        p ∨ F ≡ p
  Domination:      p ∨ T ≡ T,        p ∧ F ≡ F
  Idempotent:      p ∨ p ≡ p,        p ∧ p ≡ p
  Double Negation: ¬(¬p) ≡ p
  Negation:        p ∨ ¬p ≡ T,       p ∧ ¬p ≡ F
  Commutative:     p ∨ q ≡ q ∨ p,    p ∧ q ≡ q ∧ p
  Associative:     (p∨q)∨r ≡ p∨(q∨r)
  Distributive:    p ∨ (q∧r) ≡ (p∨q)∧(p∨r),  p ∧ (q∨r) ≡ (p∧q)∨(p∧r)
  De Morgan's:     ¬(p∧q) ≡ ¬p∨¬q,   ¬(p∨q) ≡ ¬p∧¬q
  Absorption:      p ∨ (p∧q) ≡ p,    p ∧ (p∨q) ≡ p

Two derived equivalences worth memorizing:
  IMPLICATION:   p → q  ≡  ¬p ∨ q
  BICONDITIONAL: p ↔ q  ≡  (p → q) ∧ (q → p)  ≡  (p ∧ q) ∨ (¬p ∧ ¬q)

Strategy: (1) Eliminate → and ↔. (2) Push negations inward with De Morgan's. (3) Apply distributive/absorption/idempotent. (4) Use identity/domination/negation laws.`,

      key_points: [
        'P ≡ Q means P ↔ Q is a tautology — same truth value in every row.',
        'De Morgan\'s laws push negations across ∧ and ∨ (flipping the connective).',
        'p → q ≡ ¬p ∨ q is the single most-used rewrite in proofs.',
        'Distributive law: ∧ distributes over ∨ AND ∨ distributes over ∧ — both directions.',
        'Strategy: eliminate → first, push ¬ inward, then simplify.',
        'Each line of a symbolic proof must cite the law used; otherwise it is just guessing.'
      ],

      examples: [
        {
          prompt: `Show ¬(p ∨ ¬(p ∧ q)) is a contradiction using laws.`,
          answer: `¬(p ∨ ¬(p ∧ q))
≡ ¬p ∧ ¬¬(p ∧ q)     De Morgan
≡ ¬p ∧ (p ∧ q)       double negation
≡ (¬p ∧ p) ∧ q       associative
≡ F ∧ q              negation law
≡ F                  domination. Always false ⇒ contradiction.`
        },
        {
          prompt: `Show [p ∧ (p → q)] → q is a tautology.`,
          answer: `≡ ¬[p ∧ (¬p ∨ q)] ∨ q    eliminate →
≡ ¬[(p ∧ ¬p) ∨ (p ∧ q)] ∨ q    distribute
≡ ¬[F ∨ (p ∧ q)] ∨ q    negation
≡ ¬(p ∧ q) ∨ q         identity
≡ ¬p ∨ ¬q ∨ q          De Morgan
≡ ¬p ∨ T               excluded middle
≡ T.                   domination`
        },
        {
          prompt: `Prove ¬p → (q → r) ≡ q → (p ∨ r).`,
          answer: `LHS: ¬p → (q → r) ≡ ¬¬p ∨ (¬q ∨ r) ≡ p ∨ ¬q ∨ r ≡ ¬q ∨ (p ∨ r) ≡ q → (p ∨ r). Done.`
        },
        {
          prompt: `Use distributive + absorption to simplify (p ∧ q) ∨ (p ∧ ¬q).`,
          answer: `(p ∧ q) ∨ (p ∧ ¬q) ≡ p ∧ (q ∨ ¬q) ≡ p ∧ T ≡ p.`
        },
        {
          prompt: `Prove ¬p ↔ q ≡ p ↔ ¬q using equivalences.`,
          answer: `¬p ↔ q ≡ (¬p ∧ q) ∨ (p ∧ ¬q)   biconditional expansion
       ≡ (p ∧ ¬q) ∨ (¬p ∧ q)   commutative
       ≡ p ↔ ¬q.               biconditional expansion (reverse)`
        }
      ],

      quiz: [
        {
          q: 'Which is logically equivalent to ¬(p → q)?',
          choices: ['¬p → ¬q', 'p ∧ ¬q', '¬p ∨ q', 'q → p'],
          answer: 'p ∧ ¬q',
          explanation: 'p → q ≡ ¬p ∨ q; negating gives ¬(¬p ∨ q) ≡ p ∧ ¬q.'
        },
        {
          q: '¬(p ∨ q) is equivalent to:',
          choices: ['¬p ∨ ¬q', '¬p ∧ ¬q', 'p ∧ q', 'p ↔ q'],
          answer: '¬p ∧ ¬q',
          explanation: "De Morgan's second law."
        },
        {
          q: 'Simplify (p ∧ T) ∨ (q ∧ F).',
          choices: ['p', 'q', 'p ∨ q', 'T'],
          answer: 'p',
          explanation: 'p ∧ T ≡ p; q ∧ F ≡ F; p ∨ F ≡ p.'
        },
        {
          q: 'Which law justifies (p ∧ q) ∨ p ≡ p?',
          choices: ['Identity', 'Domination', 'Absorption', 'Idempotent'],
          answer: 'Absorption',
          explanation: 'Absorption laws: p ∨ (p ∧ q) ≡ p and p ∧ (p ∨ q) ≡ p.'
        },
        {
          q: '(p → q) ∨ (p → ¬q) is:',
          choices: ['A contradiction', 'A tautology', 'Equivalent to p', 'Equivalent to q'],
          answer: 'A tautology',
          explanation: '≡ (¬p ∨ q) ∨ (¬p ∨ ¬q) ≡ ¬p ∨ (q ∨ ¬q) ≡ ¬p ∨ T ≡ T.'
        }
      ],

      math: [
        'P ≡ Q  ⇔  ⊨ P ↔ Q  (P ↔ Q is a tautology).',
        'p → q  ≡  ¬p ∨ q.',
        '¬(p ∧ q) ≡ ¬p ∨ ¬q;   ¬(p ∨ q) ≡ ¬p ∧ ¬q.',
        'p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r);   p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r).',
        'p ∨ (p ∧ q) ≡ p ≡ p ∧ (p ∨ q)   (absorption).'
      ],

      visual: {
        type: 'logic-flow',
        idea: 'A Law Card Deck: click a law card and a sub-expression to apply that rewrite. The page validates each step, refusing illegal moves.',
        interactive_hint: 'Hovering over any subexpression highlights all places where a given law could apply.'
      }
    },

    /* ========================================================
       SECTION 1.4 — Predicates and Quantifiers
    ======================================================== */
    '1.4': {
      lesson_id: 'ch1.s1.4',
      section:   '1.4',
      title:     'Predicates and Quantifiers — From Statements to Universes',
      objective: 'Define propositional functions (predicates) over a domain, apply the universal (∀) and existential (∃) quantifiers, evaluate quantified statements, and negate quantified statements using De Morgan\'s laws for quantifiers.',
      why:       'Propositional logic cannot say "every integer has a successor" or "there exists a smallest element". Predicate logic adds variables and quantifiers — the machinery behind every database query, type system, and mathematical theorem.',

      story: `Yusuf: "How do I say 'every man is mortal' in propositional logic?"

Professor Hadi: "You can't — and that's the point. Propositional logic only talks about fixed facts. Once we say 'every', we're ranging over a domain of objects. We need predicates and quantifiers."

Yusuf: "OK — so M(x) means 'x is mortal'. How do I say 'every man'?"

Professor Hadi: "Add Man(x). Now: ∀x (Man(x) → M(x)). For every x, if x is a man, then x is mortal. The implication does the filtering — non-men make the implication vacuously true."

Yusuf: "And 'some man is brave'?"

Professor Hadi: "With existential, you use ∧, not →. ∃x (Man(x) ∧ B(x)). Otherwise ∃x (Man(x) → B(x)) would be true if even one non-man exists, since the implication holds vacuously."`,

      explain: `A PREDICATE (propositional function) P(x) is a sentence with one or more free variables that becomes a proposition once each variable is replaced by a value from a DOMAIN (also called universe of discourse) U.

TWO QUANTIFIERS:

  UNIVERSAL  ∀x P(x)  — "for all x, P(x)"
       True ⇔ P(x) is true for EVERY value of x in the domain.
       False ⇔ there exists an x making P(x) false (a counterexample).

  EXISTENTIAL  ∃x P(x)  — "there exists x such that P(x)"
       True ⇔ AT LEAST ONE x in the domain makes P(x) true.
       False ⇔ P(x) is false for every x.

On a finite domain U = {a₁, …, aₙ}:
  ∀x P(x)  ≡  P(a₁) ∧ P(a₂) ∧ ⋯ ∧ P(aₙ)
  ∃x P(x)  ≡  P(a₁) ∨ P(a₂) ∨ ⋯ ∨ P(aₙ)

TWO TRANSLATION TEMPLATES:
  • "All As are Bs"   →  ∀x (A(x) → B(x))   [implication, NOT conjunction]
  • "Some A is a B"  →  ∃x (A(x) ∧ B(x))   [conjunction, NOT implication]

DE MORGAN'S LAWS FOR QUANTIFIERS:
  ¬∀x P(x)  ≡  ∃x ¬P(x)
  ¬∃x P(x)  ≡  ∀x ¬P(x)

Intuition: "not every x is P" = "some x is not P".`,

      key_points: [
        'Predicate = propositional function with free variables; needs a domain to be evaluated.',
        '∀x P(x) = AND across the whole domain. ∃x P(x) = OR across the whole domain.',
        '"All A are B" uses → inside the quantifier; "some A is B" uses ∧.',
        'Negate quantifiers by flipping the quantifier and negating the predicate.',
        'A counterexample (one x with ¬P(x)) suffices to disprove ∀x P(x).',
        'On the empty domain, ∀x P(x) is vacuously TRUE and ∃x P(x) is FALSE.'
      ],

      examples: [
        { prompt: 'Domain = integers. State truth value of (a) ∀n (n² ≥ 0), (b) ∃n (n² = 2), (c) ∀n (2n > n), (d) ∃n (n² < 0).', answer: '(a) TRUE. (b) FALSE — no integer squared equals 2. (c) FALSE — n = 0 gives 2·0 = 0, not > 0. (d) FALSE — no integer has a negative square.' },
        { prompt: 'Translate: "No student in your class has taken logic programming." Domain: students in class. L(x) = "x has taken logic programming".', answer: '¬∃x L(x), equivalently ∀x ¬L(x).' },
        { prompt: 'Express the negation of "Some drivers do not obey the speed limit" so that ¬ touches only predicates.', answer: 'Original: ∃x (D(x) ∧ ¬O(x)). Negation: ∀x (D(x) → O(x)). English: "Every driver obeys the speed limit."' },
        { prompt: 'Translate: "Every student has asked Professor Gross a question." S(x) = student, A(x,y) = x asked y.', answer: '∀x (S(x) → A(x, Gross)).' },
        { prompt: 'Domain = real numbers. Truth value of ∀x ((-x)² = x²)?', answer: 'TRUE — squaring is unaffected by sign.' }
      ],

      quiz: [
        { q: '"Every cat purrs" best translates to:', choices: ['∀x (C(x) ∧ P(x))', '∀x (C(x) → P(x))', '∃x (C(x) → P(x))', '∃x (C(x) ∧ P(x))'], answer: '∀x (C(x) → P(x))', explanation: '"All A are B" uses → inside ∀. The conjunction form would falsely claim everything is a cat.' },
        { q: 'Negate ∀x ∃y P(x,y):', choices: ['∀x ∀y ¬P(x,y)', '∃x ∀y ¬P(x,y)', '∃x ∃y ¬P(x,y)', '∀x ∃y ¬P(x,y)'], answer: '∃x ∀y ¬P(x,y)', explanation: 'Push ¬ inward: ¬∀x ⇒ ∃x ¬; then ¬∃y ⇒ ∀y ¬.' },
        { q: 'Domain = positive integers. ∃n (n² < 0) is:', choices: ['True', 'False', 'Not a proposition', 'Vacuously true'], answer: 'False', explanation: 'No positive integer (or any real) has a negative square.' },
        { q: 'What is wrong with ∃x (Man(x) → Mortal(x)) as "some man is mortal"?', choices: ['Nothing — it is correct.', 'It uses → where ∧ is needed; the implication is vacuously true if any non-man exists.', 'It should be ∀, not ∃.', 'It needs two quantifiers.'], answer: 'It uses → where ∧ is needed; the implication is vacuously true if any non-man exists.', explanation: 'The standard pitfall: "some A is B" must use ∧, not →.' },
        { q: 'If U = ∅, the statement ∀x P(x) is:', choices: ['False', 'True (vacuously)', 'Undefined', 'Equal to ∃x P(x)'], answer: 'True (vacuously)', explanation: 'Universal over empty domain is vacuously true; existential over empty domain is false.' }
      ],

      math: [
        'On finite U = {a₁,…,aₙ}: ∀x P(x) ≡ ⋀ᵢ P(aᵢ);  ∃x P(x) ≡ ⋁ᵢ P(aᵢ).',
        '¬∀x P(x) ≡ ∃x ¬P(x).',
        '¬∃x P(x) ≡ ∀x ¬P(x).',
        'Empty domain: ∀x P(x) = T (vacuous),  ∃x P(x) = F.'
      ],

      visual: {
        type: 'diagram',
        idea: 'A Universe Explorer: a horizontal strip shows the domain as dots. Pick a predicate; each dot lights green (true) or red (false). Two indicators compute ∀ and ∃ live.',
        interactive_hint: 'Drag a "counterexample finder" magnifier; if any red dot exists the ∀ indicator turns red.'
      }
    },

    /* ========================================================
       SECTION 1.5 — Nested Quantifiers
    ======================================================== */
    '1.5': {
      lesson_id: 'ch1.s1.5',
      section:   '1.5',
      title:     'Nested Quantifiers — Order Matters',
      objective: 'Read and write predicates with multiple nested quantifiers, recognize when ∀∃ and ∃∀ have different meanings, translate complex English mathematical statements, and negate nested-quantifier expressions.',
      why:       'Almost every interesting mathematical claim uses two or more quantifiers. Continuity in calculus is ∀ε∃δ. Getting the order wrong changes "every real has an additive inverse" (TRUE) into "one number is the additive inverse of every real" (FALSE).',

      story: `Mariam: "Are ∀x ∃y P(x,y) and ∃y ∀x P(x,y) the same?"

Professor Hadi: "Almost never. Take P(x,y) = 'x + y = 0' over the reals. The first says: for every real x, some y zeros it out — TRUE, y = -x. The second says: there's ONE y that zeros out every x — FALSE, no single number is the inverse of every real."

Mariam: "So the swap matters when ∀ comes first vs second?"

Professor Hadi: "Always pay attention. ∀∃ allows y to depend on x. ∃∀ forces a single y that works uniformly. The second is strictly stronger — it implies the first, but not the other way around."

Mariam: "Like in calculus — continuity vs uniform continuity?"

Professor Hadi: "Exactly that. The δ that depends on x vs the δ that doesn't. Quantifier order is the whole difference."`,

      explain: `NESTED QUANTIFIERS apply two or more quantifiers in sequence.

READING AS LOOPS:
  • ∀x ∀y P(x,y) — "for every pair (x,y), P holds."
  • ∀x ∃y P(x,y) — "for every x there is SOME y (possibly depending on x) making P(x,y) true."
  • ∃x ∀y P(x,y) — "there is one x that makes P(x,y) true for all y."
  • ∃x ∃y P(x,y) — "there exists at least one pair (x,y)."

ORDER — KEY FACT: same-type quantifiers commute, different-type quantifiers do NOT.
  ∀x ∀y P(x,y) ≡ ∀y ∀x P(x,y)
  ∃x ∃y P(x,y) ≡ ∃y ∃x P(x,y)
  ∃y ∀x P(x,y) ⇒ ∀x ∃y P(x,y)   (one direction only — strictly stronger)

NEGATING NESTED QUANTIFIERS — push the negation inward:
  ¬∀x ∃y P(x,y)  ≡  ∃x ¬∃y P(x,y)  ≡  ∃x ∀y ¬P(x,y)
  ¬∃x ∀y P(x,y)  ≡  ∀x ¬∀y P(x,y)  ≡  ∀x ∃y ¬P(x,y)`,

      key_points: [
        'Same quantifier swaps freely; mixed ∀/∃ generally do NOT.',
        '∃y ∀x P(x,y) IMPLIES ∀x ∃y P(x,y), but the reverse fails.',
        'In ∀x ∃y, the y can depend on x; in ∃y ∀x, the y must be the same for all x.',
        'Negation: flip each quantifier and negate the innermost predicate.',
        'Implicit universal quantifiers are common in math — make them explicit before translating.',
        'Reading nested quantifiers as nested loops ("outer x, inner y") makes order intuitive.'
      ],

      examples: [
        { prompt: 'Domain = real numbers. Truth values: (a) ∀x ∀y (x + y = y + x), (b) ∀x ∃y (x + y = 0), (c) ∃y ∀x (x + y = 0).', answer: '(a) TRUE — commutativity. (b) TRUE — for each x, take y = -x. (c) FALSE — no single y is the additive inverse of every x.' },
        { prompt: 'Translate: "There is a woman who has taken a flight on every airline." P(w,f) = "w has taken f", Q(f,a) = "f is on airline a".', answer: '∃w ∀a ∃f (P(w,f) ∧ Q(f,a)).' },
        { prompt: 'Translate: "Every real number has a multiplicative inverse, except 0."', answer: '∀x ((x ≠ 0) → ∃y (xy = 1)).' },
        { prompt: 'Negate ∀x ∃y (P(x,y) → Q(x,y)) so that ¬ touches only predicates.', answer: '¬∀x ∃y (P → Q) ≡ ∃x ∀y ¬(P → Q) ≡ ∃x ∀y (P(x,y) ∧ ¬Q(x,y)).' },
        { prompt: 'Domain = integers. What is the truth value of ∀n ∃m (n + m = 0)?', answer: 'TRUE — for every integer n, take m = -n.' }
      ],

      quiz: [
        { q: 'Which is ALWAYS true?', choices: ['∀x ∃y P(x,y) → ∃y ∀x P(x,y)', '∃y ∀x P(x,y) → ∀x ∃y P(x,y)', '∀x ∃y P ↔ ∃y ∀x P', 'All of the above'], answer: '∃y ∀x P(x,y) → ∀x ∃y P(x,y)', explanation: 'A single uniform witness implies a per-x witness, but not vice versa.' },
        { q: 'Negate ∃x ∀y (x ≤ y) over the integers.', choices: ['∀x ∃y (x > y)', '∃x ∀y (x > y)', '∀x ∀y (x > y)', '∃x ∃y (x ≤ y)'], answer: '∀x ∃y (x > y)', explanation: 'Flip ∃ to ∀, ∀ to ∃, and negate ≤ to >.' },
        { q: 'Over the reals, ∀x ∃y (xy = 1) is:', choices: ['True', 'False (x = 0 has no inverse)', 'True only for positive reals', 'Undefined'], answer: 'False (x = 0 has no inverse)', explanation: 'For x = 0, no y satisfies 0·y = 1.' },
        { q: 'Which English sentence matches ∀x ∃y L(x,y), where L(x,y) = "x loves y"?', choices: ['Everybody loves somebody.', 'Somebody is loved by everybody.', 'Everybody loves everybody.', 'Somebody loves somebody.'], answer: 'Everybody loves somebody.', explanation: 'For every x, there is at least one y that x loves.' },
        { q: 'Domain = positive integers. ∃n ∀m (nm = m) is:', choices: ['True (n = 1)', 'True (n = 0)', 'False', 'Depends on m'], answer: 'True (n = 1)', explanation: 'n = 1 satisfies 1·m = m for all m. (0 is not in the positive-integer domain.)' }
      ],

      math: [
        '∀x ∀y P(x,y) ≡ ∀y ∀x P(x,y);  ∃x ∃y ≡ ∃y ∃x.',
        '∃y ∀x P(x,y) ⇒ ∀x ∃y P(x,y); not generally the reverse.',
        '¬∀x ∃y P ≡ ∃x ∀y ¬P;   ¬∃x ∀y P ≡ ∀x ∃y ¬P.',
        'Limit definition: ∀ε>0 ∃δ>0 ∀x (|x − a| < δ → |f(x) − L| < ε) — pure ∀∃∀.'
      ],

      visual: {
        type: 'simulation',
        idea: 'A 2-D grid: x-axis one variable, y-axis another. Buttons toggle ∀∀, ∀∃, ∃∀, ∃∃. Edit P to see how flipping a single cell changes ∀∃ vs ∃∀.',
        interactive_hint: 'Toggle a single cell from green to red and watch how that one change can break ∀∃ but leave ∃∀ untouched.'
      }
    },

    /* ========================================================
       SECTION 1.6 — Rules of Inference
    ======================================================== */
    '1.6': {
      lesson_id: 'ch1.s1.6',
      section:   '1.6',
      title:     'Rules of Inference — Building Valid Arguments',
      objective: 'Identify the standard inference rules (Modus Ponens, Modus Tollens, Hypothetical Syllogism, Disjunctive Syllogism, Addition, Simplification, Conjunction, Resolution), apply the four quantifier inference rules (UI, UG, EI, EG), and chain rules into multi-step formal proofs.',
      why:       'Equivalences let you rewrite a single proposition; inference rules let you DERIVE NEW PROPOSITIONS from old ones. Every formal proof in mathematics, every line in a Coq or Lean proof, is an instance of one of these rules.',

      story: `Aisha: "How do I PROVE 'It rained' from 'If it didn't rain, the race is held' and 'The trophy wasn't awarded' and 'If the race is held, the trophy is awarded'?"

Professor Hadi: "Chain rules. Race held → trophy awarded; trophy wasn't awarded — that's Modus Tollens, so race not held. Then 'not rained → race held' contraposes to 'race not held → it rained'. Apply Modus Ponens."

Aisha: "So I built a chain of rules instead of one big truth table."

Professor Hadi: "Yes — and for n premises with k variables, the truth-table approach is exponential in k. The rule-of-inference approach is linear in the number of steps. That's why proof assistants are practical and brute-force is not."`,

      explain: `A VALID ARGUMENT is a sequence of propositions p₁, p₂, …, pₙ (premises) leading to a conclusion q, such that whenever every premise is true, q is also true. Equivalently, (p₁ ∧ ⋯ ∧ pₙ) → q is a tautology.

The standard INFERENCE RULES of propositional logic:

  Modus Ponens          [p, p → q]       ⊢ q
  Modus Tollens         [¬q, p → q]      ⊢ ¬p
  Hypothetical Syll.    [p → q, q → r]   ⊢ p → r
  Disjunctive Syll.     [p ∨ q, ¬p]      ⊢ q
  Addition              [p]              ⊢ p ∨ q
  Simplification        [p ∧ q]          ⊢ p
  Conjunction           [p, q]           ⊢ p ∧ q
  Resolution            [p ∨ q, ¬p ∨ r]  ⊢ q ∨ r

FOUR QUANTIFIER RULES:
  UI (Universal Instantiation):   ∀x P(x) ⊢ P(c)  for any specific c.
  UG (Universal Generalization):  P(c) for arbitrary c ⊢ ∀x P(x).
  EI (Existential Instantiation): ∃x P(x) ⊢ P(c)  for a FRESH constant c.
  EG (Existential Generalization): P(c) ⊢ ∃x P(x).

FALLACIES TO AVOID:
  Affirming the Consequent: from p → q and q, infer p — INVALID.
  Denying the Antecedent:   from p → q and ¬p, infer ¬q — INVALID.`,

      key_points: [
        'Valid argument ⇔ (conjunction of premises) → conclusion is a tautology.',
        'Modus Ponens: p, p→q ⊢ q.  Modus Tollens: ¬q, p→q ⊢ ¬p.',
        'Disjunctive Syllogism: from p ∨ q and ¬p infer q.',
        'Resolution: [p ∨ q, ¬p ∨ r] ⊢ q ∨ r — the workhorse of automated theorem provers.',
        'UI brings universals down to specific instances; UG promotes a result about an arbitrary element to all elements.',
        'EI introduces a FRESH constant; never reuse a name from earlier in the proof.',
        'Affirming the consequent and denying the antecedent are common fallacies.'
      ],

      examples: [
        { prompt: 'Premises: (1) ¬r ∨ ¬f → (s ∧ d), (2) s → t, (3) ¬t. Conclude: r.', answer: '4. ¬s                   Modus Tollens (2,3)\n5. ¬s ∨ ¬d              Addition (4)\n6. ¬(s ∧ d)             De Morgan (5)\n7. ¬(¬r ∨ ¬f)           Modus Tollens (1,6)\n8. r ∧ f                De Morgan + double neg (7)\n9. r                    Simplification (8). ∎' },
        { prompt: 'Show: if ∀x (P(x) → (Q(x) ∧ S(x))) and ∀x (P(x) ∧ R(x)), then ∀x (R(x) ∧ S(x)).', answer: '1. P(c) ∧ R(c)         UI on 2nd premise\n2. P(c)                Simplification\n3. R(c)                Simplification\n4. P(c) → Q(c) ∧ S(c)  UI on 1st premise\n5. Q(c) ∧ S(c)         MP (2,4)\n6. S(c)                Simplification\n7. R(c) ∧ S(c)         Conjunction (3,6)\n8. ∀x (R(x) ∧ S(x))   UG (7). ∎' },
        { prompt: 'Identify: "If it snows, the university closes. Not closed. Therefore, no snow."', answer: 'Modus Tollens.' },
        { prompt: 'Valid? "Every CS major takes discrete math. Natasha takes discrete math. Therefore, Natasha is a CS major."', answer: 'INVALID — affirming the consequent.' },
        { prompt: 'Use Resolution: from p ∨ q and ¬p ∨ r, infer?', answer: 'q ∨ r.' }
      ],

      quiz: [
        { q: 'From "If I study, I pass." and "I do not pass", conclude:', choices: ['I study.', 'I do not study.', 'Either I study or I pass.', 'Cannot conclude.'], answer: 'I do not study.', explanation: 'Modus Tollens: ¬q, p → q ⊢ ¬p.' },
        { q: 'From p ∨ q and ¬p ∨ r, Resolution yields:', choices: ['p ∨ r', 'q ∨ r', 'p ∧ r', '¬p ∨ q'], answer: 'q ∨ r', explanation: 'Resolution cancels p with ¬p and disjoins the remaining literals.' },
        { q: 'Which is INVALID?', choices: ['Modus Ponens', 'Modus Tollens', 'Affirming the Consequent', 'Hypothetical Syllogism'], answer: 'Affirming the Consequent', explanation: 'From p → q and q, you cannot conclude p.' },
        { q: 'Existential Instantiation introduces a constant that:', choices: ['Must equal a named element.', 'May be any previously used name.', 'Must be a NEW name not used elsewhere.', 'Need not exist if domain is empty.'], answer: 'Must be a NEW name not used elsewhere.', explanation: "EI's witness is unknown; reusing a name would assert facts about a specific known element." },
        { q: 'From ∀x (P(x) → Q(x)) and P(a), conclude:', choices: ['P(a) ∨ Q(a)', 'Q(a)', '∀x Q(x)', '∃x P(x)'], answer: 'Q(a)', explanation: 'UI gives P(a) → Q(a); MP with P(a) gives Q(a).' }
      ],

      math: [
        'Modus Ponens:    [p, p → q] ⊢ q.',
        'Modus Tollens:   [¬q, p → q] ⊢ ¬p.',
        'Hypothetical Syllogism: [p → q, q → r] ⊢ p → r.',
        'Disjunctive Syllogism:  [p ∨ q, ¬p] ⊢ q.',
        'Resolution:      [p ∨ q, ¬p ∨ r] ⊢ q ∨ r.',
        'UI: ∀x P(x) ⊢ P(c).  UG: P(c) arbitrary ⊢ ∀x P(x).',
        'EI: ∃x P(x) ⊢ P(c) for fresh c.  EG: P(c) ⊢ ∃x P(x).'
      ],

      visual: {
        type: 'logic-flow',
        idea: 'A Proof Tree Builder: display premises as leaf cards and connect them via labeled edges representing inference rules. Each node shows the inferred proposition and its justification.',
        interactive_hint: 'Drag a premise card onto a rule symbol; the page auto-fills the result. Wrong rule selections show a red "pattern mismatch" indicator.'
      }
    },

    /* ========================================================
       SECTION 1.7 — Introduction to Proofs
    ======================================================== */
    '1.7': {
      lesson_id: 'ch1.s1.7',
      section:   '1.7',
      title:     'Introduction to Proofs — Direct, Contrapositive, and Contradiction',
      objective: 'Distinguish theorems, axioms, lemmas, corollaries, and conjectures; produce direct proofs and proofs by contraposition; produce proofs by contradiction; recognize trivial and vacuous proofs; and prove biconditional statements as two implications.',
      why:       'Inference rules are the alphabet; proofs are the literature. A proof transforms a conjecture into a theorem — something every future reader can rely on. Even if you never publish a math paper, you\'ll write proofs every time you argue why a loop terminates or why a security protocol is sound.',

      story: `Hassan: "How do I prove 'if n is odd, then n² is odd'?"

Professor Hadi: "Direct proof. Assume the hypothesis: n is odd, so n = 2k + 1 for some integer k. Square: n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which has the form 2r + 1, so n² is odd. ∎"

Hassan: "What about 'if n² is odd, then n is odd'?"

Professor Hadi: "Direct is awkward — you'd have to factor n² = 2k+1, which is messy. Try CONTRAPOSITION: assume n is even, show n² is even. n = 2k, so n² = 4k² = 2(2k²), even. By contraposition, n² odd → n odd."

Hassan: "And √2 is irrational?"

Professor Hadi: "That one needs CONTRADICTION. Suppose √2 = a/b in lowest terms; derive that a and b are both even — contradicting 'lowest terms'."`,

      explain: `TERMINOLOGY:
  • THEOREM — a statement proven true.
  • AXIOM — a foundational truth taken without proof.
  • LEMMA — a "helper" theorem used inside a larger proof.
  • COROLLARY — an immediate consequence of a theorem.
  • CONJECTURE — a statement believed true but unproven.

PROVING p → q — five techniques:

1) DIRECT PROOF: Assume p; derive q.
   Template: "Assume p. Then … therefore q. ∎"
   Example: n = 2k+1 ⇒ n² = 2(2k²+2k)+1, odd.

2) PROOF BY CONTRAPOSITION: Prove ¬q → ¬p instead.
   Example: n² odd ← assume n even, show n² even.

3) PROOF BY CONTRADICTION: Assume ¬p, derive r ∧ ¬r.
   Example: √2 irrational — assume √2 = a/b in lowest terms; derive 2|a and 2|b.

4) TRIVIAL PROOF: Show q is true outright; then p → q holds regardless of p.

5) VACUOUS PROOF: Show p is false; then p → q is vacuously true.

BICONDITIONAL p ↔ q: Prove BOTH p → q AND q → p.

DEFINITIONS:
  n is EVEN iff ∃k ∈ ℤ, n = 2k.
  n is ODD  iff ∃k ∈ ℤ, n = 2k + 1.
  r is RATIONAL iff ∃p, q ∈ ℤ with q ≠ 0, r = p/q.`,

      key_points: [
        'Theorem = proven claim; lemma = helper; corollary = quick consequence; conjecture = unproven; axiom = accepted without proof.',
        'Direct proof: assume p, derive q.',
        'Contrapositive proof: prove ¬q → ¬p (logically equivalent to p → q).',
        'Proof by contradiction: assume ¬(claim), derive r ∧ ¬r.',
        'Trivial proof: q is already true. Vacuous proof: p is already false.',
        'Biconditional p ↔ q requires two proofs (both directions).',
        'Definitions: even = 2k, odd = 2k+1, rational = p/q with q ≠ 0.'
      ],

      examples: [
        { prompt: 'Direct proof: "The sum of two even integers is even."', answer: 'Let m = 2a, n = 2b. Then m + n = 2a + 2b = 2(a+b). Since a+b ∈ ℤ, m+n is even. ∎' },
        { prompt: 'Direct proof: "Every odd integer is the difference of two squares."', answer: 'Let n = 2k+1. Note (k+1)² − k² = (k²+2k+1) − k² = 2k+1 = n. ∎' },
        { prompt: 'Contraposition: "If x+y ≥ 2 (real x,y), then x ≥ 1 or y ≥ 1."', answer: 'Contrapositive: assume x < 1 and y < 1. Then x+y < 2. Done. ∎' },
        { prompt: 'Contradiction: "There are infinitely many primes."', answer: 'Assume finitely many primes p₁,…,pₙ. Form r = p₁⋯pₙ + 1. r leaves remainder 1 when divided by any pᵢ. Either r is prime (new prime) or has an unlisted prime factor. Contradiction. ∎' },
        { prompt: 'Biconditional: "For integers n, n is odd iff n² is odd."', answer: '(⇒) Direct: n = 2k+1 ⇒ n² = 2(2k²+2k)+1, odd.\n(⇐) Contrapositive: n even ⇒ n = 2k ⇒ n² = 2(2k²), even. So n² odd ⇒ n odd. ∎' }
      ],

      quiz: [
        { q: 'Which proof method is best for "If n² is odd, then n is odd"?', choices: ['Direct (assume n² odd, derive n odd)', 'Contrapositive (assume n even, derive n² even)', 'Vacuous', 'Trivial'], answer: 'Contrapositive (assume n even, derive n² even)', explanation: 'Direct proof would require factoring an odd square — clumsy. Contrapositive is direct.' },
        { q: 'A proof by contradiction of claim p:', choices: ['Assumes p and derives a contradiction.', 'Assumes ¬p and derives a contradiction.', 'Assumes nothing and derives p directly.', 'Builds a counterexample.'], answer: 'Assumes ¬p and derives a contradiction.', explanation: 'If ¬p leads to a contradiction, ¬p is false, so p is true.' },
        { q: 'A theorem of the form "p ↔ q" requires:', choices: ['One direct proof', 'Two proofs (one for each direction)', 'A truth table', 'A counterexample'], answer: 'Two proofs (one for each direction)', explanation: 'p ↔ q ≡ (p → q) ∧ (q → p); each implication is proven separately.' },
        { q: 'Which is a VACUOUS proof of "if 0 = 1, then I am the king of England"?', choices: ['Show I am the king of England.', 'Show 0 ≠ 1, so the hypothesis is false; the implication holds.', 'Find someone else who is king.', 'Use truth tables.'], answer: 'Show 0 ≠ 1, so the hypothesis is false; the implication holds.', explanation: 'When the antecedent is false, the implication is vacuously true.' },
        { q: 'A LEMMA is best described as:', choices: ['An unproven conjecture.', 'An axiom.', 'An auxiliary result used in proving a larger theorem.', 'An immediate consequence of a theorem.'], answer: 'An auxiliary result used in proving a larger theorem.', explanation: 'Corollary = immediate consequence; conjecture = unproven; axiom = accepted without proof.' }
      ],

      math: [
        'Direct: assume p, derive q.',
        'Contrapositive: p → q ≡ ¬q → ¬p; assume ¬q, derive ¬p.',
        'Contradiction: to prove p, assume ¬p, derive r ∧ ¬r.',
        'Vacuous: ¬p ⇒ p → q.  Trivial: q ⇒ p → q.',
        'Biconditional: prove (p → q) ∧ (q → p).',
        'n even ⇔ ∃k ∈ ℤ: n = 2k.  n odd ⇔ ∃k ∈ ℤ: n = 2k + 1.'
      ],

      visual: {
        type: 'logic-flow',
        idea: 'A Proof Method Selector diagram: three branches descend — Direct, Contrapositive, Contradiction. Each branch shows the assumption box, intermediate steps, and conclusion.',
        interactive_hint: 'Pick a goal from a menu (e.g., "sum of evens is even") and the appropriate branch animates with the worked proof.'
      }
    },

    /* ========================================================
       SECTION 1.8 — Proof Methods and Strategy
    ======================================================== */
    '1.8': {
      lesson_id: 'ch1.s1.8',
      section:   '1.8',
      title:     'Proof Methods and Strategy — Cases, Existence, Counterexamples, Uniqueness',
      objective: 'Construct proofs by cases (including WLOG), produce constructive and nonconstructive existence proofs, disprove universal claims by counterexample, prove uniqueness, and choose a proof strategy (forward vs backward reasoning).',
      why:       'By Section 1.7 you have the basic toolkit; Section 1.8 is where craft begins. Real theorems require splitting into cases, finding clever witnesses, exploiting symmetry, or proving uniqueness. These moves distinguish a professional proof from a student exercise.',

      story: `Lina: "I need to show 'for every integer n, |n| ≥ 0'. But absolute value is defined piecewise — how do I write one proof?"

Professor Hadi: "PROOF BY CASES. Handle each piece of the definition separately. Case 1: n ≥ 0, then |n| = n ≥ 0. Case 2: n < 0, then |n| = −n > 0. Both cases cover every integer, so done."

Lina: "And how do I show 'there exist irrationals x, y with x^y rational'?"

Professor Hadi: "NONCONSTRUCTIVE EXISTENCE. Look at √2^√2. If it's rational, take x = y = √2. If it's irrational, take x = √2^√2 and y = √2; then x^y = (√2^√2)^√2 = √2^2 = 2, rational. Either way, such x and y exist — without ever telling you which case is the real one."

Lina: "So I proved existence without producing the actual numbers?"

Professor Hadi: "That's the whole point. Constructive proofs build the witness; nonconstructive proofs show that one must exist."`,

      explain: `PROOF BY CASES: When a hypothesis splits into exhaustive subcases p₁ ∨ ⋯ ∨ pₙ, prove the conclusion in each case separately.

WITHOUT LOSS OF GENERALITY (WLOG): When two or more cases are structurally identical except for relabeling, prove one and state the other "WLOG". The cases must truly be symmetric.

EXISTENCE PROOFS:
  • CONSTRUCTIVE: explicitly produce a c with P(c). E.g., 1729 = 10³+9³ = 12³+1³.
  • NONCONSTRUCTIVE: prove existence without producing c — often via contradiction or case analysis.

DISPROOF BY COUNTEREXAMPLE: To disprove ∀x P(x), exhibit one c with ¬P(c). A single example suffices.

UNIQUENESS PROOFS (∃!x P(x)):
  (1) EXISTENCE: produce some x with P(x).
  (2) UNIQUENESS: assume P(x) and P(y), then derive x = y.

STRATEGY — CHOOSING A METHOD:
  1. Try DIRECT proof first.
  2. If direct gets ugly, try CONTRAPOSITION or CONTRADICTION.
  3. If claim involves cases (parity, sign, comparison), use PROOF BY CASES.
  4. For ∃ claims, try CONSTRUCTIVE witness; if you can't find one, try NONCONSTRUCTIVE.
  5. To disprove ∀, hunt for a COUNTEREXAMPLE.

FORWARD vs BACKWARD REASONING:
  • FORWARD: start from hypothesis, apply rules, push toward conclusion.
  • BACKWARD: start from conclusion, find a sufficient condition, then a sufficient condition for that.`,

      key_points: [
        'Proof by cases requires that the cases be EXHAUSTIVE.',
        'WLOG only when the cases are truly symmetric.',
        'Constructive existence: produce a witness. Nonconstructive: prove one must exist without producing it.',
        'A single counterexample disproves ∀x P(x).',
        'Uniqueness proofs have two halves: existence + "any two are equal".',
        'Strategy ladder: direct → contraposition → contradiction → cases → constructive ∃ → nonconstructive ∃.',
        'Forward reasoning grows the known; backward reasoning grows the goal — combine them.'
      ],

      examples: [
        { prompt: 'By cases: "For every integer n, n² ≥ n."', answer: 'Case 1: n ≥ 1. Then n² = n·n ≥ n·1 = n.\nCase 2: n = 0. Then n² = 0 = n.\nCase 3: n ≤ -1. Then n² ≥ 1 > 0 > n.\nCases exhaust ℤ. ∎' },
        { prompt: 'Constructive existence: "There is a positive integer expressible as a sum of two cubes in two different ways."', answer: '1729 = 1³ + 12³ = 9³ + 10³. ∎ (Hardy-Ramanujan number.)' },
        { prompt: 'Counterexample: "Every prime is odd."', answer: '2 is prime and even. ∎ (disproof)' },
        { prompt: 'Uniqueness: "For real a ≠ 0, b, the equation ax + b = 0 has a unique real solution."', answer: 'Existence: x = −b/a.\nUniqueness: if ay + b = 0 too, then ay = ax, so y = x. ∎' },
        { prompt: 'Backward reasoning: "In a game removing 1, 2, or 3 stones from 15, the first player wins."', answer: 'Multiples of 4 are LOSING positions. 15 mod 4 = 3, so first player removes 3, leaving 12 (losing position for opponent). ∎' }
      ],

      quiz: [
        { q: 'To disprove "every prime is odd", the cleanest argument is:', choices: ['Direct proof of the negation', 'A counterexample (e.g., 2)', 'Proof by contradiction', 'Proof by cases'], answer: 'A counterexample (e.g., 2)', explanation: 'One counterexample disproves a universal claim.' },
        { q: 'A NONCONSTRUCTIVE existence proof:', choices: ['Produces an explicit witness.', 'Proves a witness must exist without naming it.', 'Uses induction.', 'Always uses contradiction.'], answer: 'Proves a witness must exist without naming it.', explanation: 'It establishes existence (often via contradiction or case analysis) but does not exhibit a specific c.' },
        { q: 'A uniqueness proof of ∃!x P(x) requires:', choices: ['Only existence.', 'Only uniqueness.', 'Existence AND a proof that any two witnesses are equal.', 'A truth table.'], answer: 'Existence AND a proof that any two witnesses are equal.', explanation: 'Both halves are needed; existence alone does not rule out multiple witnesses.' },
        { q: 'WLOG ("without loss of generality") is appropriate when:', choices: ['The omitted case is similar by symmetry.', 'You forgot to handle the case.', 'The case is too long to write.', 'The case is unimportant.'], answer: 'The omitted case is similar by symmetry.', explanation: 'WLOG is a shortcut for "this argument works for the other case verbatim, swapping labels".' },
        { q: 'Backward reasoning is most useful when:', choices: ['Hypotheses are abundant and clear.', 'The conclusion suggests a sufficient condition you know how to prove.', 'There is no hypothesis.', 'You are writing a counterexample.'], answer: 'The conclusion suggests a sufficient condition you know how to prove.', explanation: 'Backward reasoning seeks a chain of sufficient conditions that ends at a known fact.' }
      ],

      math: [
        'Cases: (p₁ ∨ ⋯ ∨ pₙ) → q proved as (p₁ → q) ∧ ⋯ ∧ (pₙ → q).',
        'WLOG ⇔ symmetric cases collapse to one labeled subproof.',
        '∃!x P(x) ⇔ ∃x (P(x) ∧ ∀y (P(y) → y = x)).',
        'Counterexample for ∀x P(x): a single c with ¬P(c).',
        'Forward + backward: ask "what do I know?" (forward) and "what would suffice?" (backward).'
      ],

      visual: {
        type: 'logic-flow',
        idea: 'A Proof Strategy Decision Tree: starting from the form of the claim, the diagram branches into the recommended technique. Each leaf links to a worked example.',
        interactive_hint: 'Plug in your own claim; the page suggests the most likely method and offers a template skeleton you fill in.'
      }
    }

  }; // end _LESSONS

  /* ----------------------------------------------------------
     MERGE VALIDATION
     Checks that all 4 layers are present for each lesson.
  ---------------------------------------------------------- */
  function _validate() {
    var sections = Object.keys(_LESSONS);
    var ok = true;
    sections.forEach(function(s) {
      var l = _LESSONS[s];
      if (!l.title)     { console.warn('JsonLoader: missing title for', s); ok = false; }
      if (!l.visual)    { console.warn('JsonLoader: missing visual for', s); }
      if (!l.math)      { console.warn('JsonLoader: missing math for', s); }
      if (!l.quiz)      { console.warn('JsonLoader: missing quiz for', s); }
      if (!l.examples)  { console.warn('JsonLoader: missing examples for', s); }
    });
    return ok;
  }

  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */
  global.JsonLoader = {
    /**
     * Initialize and validate the data store.
     * Returns true if all required sections are present.
     */
    init: function () {
      try {
        var valid = _validate();
        console.log('[JsonLoader] Initialized. Lessons:', Object.keys(_LESSONS).length);
        return valid;
      } catch (e) {
        console.error('[JsonLoader] Init failed:', e);
        return false;
      }
    },

    /** Get a single merged lesson object by section string (e.g. "1.1"). */
    getLesson: function (section) {
      return _LESSONS[section] || null;
    },

    /** Get all lessons as an array, sorted by section. */
    getAllLessons: function () {
      return Object.keys(_LESSONS)
        .sort(function (a, b) {
          return parseFloat(a) - parseFloat(b);
        })
        .map(function (s) { return _LESSONS[s]; });
    },

    /** Get course metadata. */
    getMeta: function () {
      return Object.assign({}, _META);
    }
  };

})(window);

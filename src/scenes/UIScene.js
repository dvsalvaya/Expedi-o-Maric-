import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { state } from '../state.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.currentNpc = null;
    this.falaIndex = 0;
    this.isShowingConclusion = false;
    this.npcQuestions = [];
    this.questionIndex = 0;
    this.currentQuestion = null;
    this.selectedOptionIndex = 0;

    // Teclas para interação geral (avançar diálogo / avançar feedback / confirmar quiz)
    this.interactKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    ];

    // Teclas de navegação do quiz (↑ e ↓ / W e S)
    this.navKeys = {
      up: [
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
      ],
      down: [
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
      ]
    };

    // Teclas numéricas 1-4 para escolha direta
    this.numberKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR)
    ];

    this.createHUD();
    this.createDialogUI();
    this.createQuizUI();
    this.createFeedbackUI();

    // Eventos
    this.game.events.on('npc:interact', this.handleNpcInteraction, this);
    this.updateHUD();
  }

  createHUD() {
    this.hudContainer = this.add.container(10, 10);

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.7);
    hudBg.fillRoundedRect(0, 0, 190, 26, 4);
    hudBg.lineStyle(1, 0x475569, 0.8);
    hudBg.strokeRoundedRect(0, 0, 190, 26, 4);
    this.hudContainer.add(hudBg);

    this.pointsText = this.add.text(10, 6, 'Pontos: 0', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#facc15'
    });
    this.hudContainer.add(this.pointsText);

    this.npcsText = this.add.text(105, 6, 'NPCs: 0/5', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#38bdf8'
    });
    this.hudContainer.add(this.npcsText);
  }

  updateHUD() {
    this.pointsText.setText(`Pontos: ${state.pontos}`);
    const concluidosCount = state.npcsConcluidos ? state.npcsConcluidos.size : 0;
    this.npcsText.setText(`NPCs: ${concluidosCount}/5`);
  }

  createDialogUI() {
    this.dialogBox = this.add.container(0, 0);
    this.dialogBox.setVisible(false);

    const boxWidth = CONFIG.width - 24;
    const boxHeight = 72;
    const boxX = 12;
    const boxY = CONFIG.height - boxHeight - 8;

    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 0.94);
    bg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 6);
    bg.lineStyle(2, 0xffffff, 0.85);
    bg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 6);
    this.dialogBox.add(bg);

    this.nameText = this.add.text(boxX + 12, boxY + 8, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffeb3b'
    });
    this.dialogBox.add(this.nameText);

    this.labelTag = this.add.text(boxX + 12, boxY + 24, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#81d4fa'
    });
    this.dialogBox.add(this.labelTag);

    this.dialogText = this.add.text(boxX + 12, boxY + 38, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: boxWidth - 36, useAdvancedWrap: true }
    });
    this.dialogBox.add(this.dialogText);

    this.nextIndicator = this.add.text(boxX + boxWidth - 18, boxY + boxHeight - 16, '▼', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff'
    });
    this.dialogBox.add(this.nextIndicator);

    this.tweens.add({
      targets: this.nextIndicator,
      alpha: 0.2,
      yoyo: true,
      repeat: -1,
      duration: 400
    });
  }

  createQuizUI() {
    this.quizContainer = this.add.container(0, 0);
    this.quizContainer.setVisible(false);

    const pWidth = CONFIG.width - 40;
    const pHeight = 250;
    const pX = 20;
    const pY = (CONFIG.height - pHeight) / 2;

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0f172a, 0.96);
    panelBg.fillRoundedRect(pX, pY, pWidth, pHeight, 8);
    panelBg.lineStyle(2, 0x38bdf8, 0.9);
    panelBg.strokeRoundedRect(pX, pY, pWidth, pHeight, 8);
    this.quizContainer.add(panelBg);

    this.quizHeader = this.add.text(pX + 16, pY + 12, 'DESAFIO DO QUIZ', {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#38bdf8'
    });
    this.quizContainer.add(this.quizHeader);

    this.questionText = this.add.text(pX + 16, pY + 32, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: pWidth - 32, useAdvancedWrap: true }
    });
    this.quizContainer.add(this.questionText);

    this.optionButtons = [];
    const optYStart = pY + 85;
    const optHeight = 32;
    const optGap = 6;

    for (let i = 0; i < 4; i++) {
      const optY = optYStart + i * (optHeight + optGap);

      const bgGraphic = this.add.graphics();
      const textGraphic = this.add.text(pX + 22, optY + 8, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffffff'
      });

      const hitZone = this.add.zone(pX + 12, optY, pWidth - 24, optHeight)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

      const optIndex = i;
      hitZone.on('pointerover', () => {
        if (state.fase === 'QUIZ') {
          this.selectedOptionIndex = optIndex;
          this.renderQuizSelection();
        }
      });

      hitZone.on('pointerdown', () => {
        if (state.fase === 'QUIZ') {
          this.selectedOptionIndex = optIndex;
          this.confirmQuizAnswer(optIndex);
        }
      });

      this.quizContainer.add(bgGraphic);
      this.quizContainer.add(textGraphic);
      this.quizContainer.add(hitZone);

      this.optionButtons.push({
        bg: bgGraphic,
        text: textGraphic,
        zone: hitZone,
        x: pX + 12,
        y: optY,
        w: pWidth - 24,
        h: optHeight
      });
    }
  }

  createFeedbackUI() {
    this.feedbackContainer = this.add.container(0, 0);
    this.feedbackContainer.setVisible(false);

    const fWidth = CONFIG.width - 40;
    const fHeight = 250;
    const fX = 20;
    const fY = (CONFIG.height - fHeight) / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.96);
    bg.fillRoundedRect(fX, fY, fWidth, fHeight, 8);
    bg.lineStyle(2, 0x38bdf8, 0.9);
    bg.strokeRoundedRect(fX, fY, fWidth, fHeight, 8);
    this.feedbackContainer.add(bg);

    this.feedbackStatusText = this.add.text(fX + 16, fY + 14, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      fontStyle: 'bold'
    });
    this.feedbackContainer.add(this.feedbackStatusText);

    this.feedbackCorrectAnswerText = this.add.text(fX + 16, fY + 44, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#4ade80',
      wordWrap: { width: fWidth - 32, useAdvancedWrap: true }
    });
    this.feedbackContainer.add(this.feedbackCorrectAnswerText);

    this.feedbackExplanationText = this.add.text(fX + 16, fY + 76, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e2e8f0',
      wordWrap: { width: fWidth - 32, useAdvancedWrap: true }
    });
    this.feedbackContainer.add(this.feedbackExplanationText);

    this.feedbackSourceText = this.add.text(fX + 16, fY + 180, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      fontStyle: 'italic',
      color: '#94a3b8',
      wordWrap: { width: fWidth - 32, useAdvancedWrap: true }
    });
    this.feedbackContainer.add(this.feedbackSourceText);

    this.feedbackPrompt = this.add.text(fX + 16, fY + fHeight - 24, 'Pressione Espaço / Enter para continuar ▼', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#facc15'
    });
    this.feedbackContainer.add(this.feedbackPrompt);

    const feedbackZone = this.add.zone(fX, fY, fWidth, fHeight)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    feedbackZone.on('pointerdown', () => {
      if (state.fase === 'FEEDBACK') {
        this.closeFeedback();
      }
    });
    this.feedbackContainer.add(feedbackZone);
  }

  renderQuizSelection() {
    this.optionButtons.forEach((btn, index) => {
      btn.bg.clear();
      const isSelected = index === this.selectedOptionIndex;
      if (isSelected) {
        btn.bg.fillStyle(0x1e293b, 1);
        btn.bg.fillRoundedRect(btn.x, btn.y, btn.w, btn.h, 4);
        btn.bg.lineStyle(2, 0xfacc15, 1);
        btn.bg.strokeRoundedRect(btn.x, btn.y, btn.w, btn.h, 4);
        btn.text.setColor('#facc15');
      } else {
        btn.bg.fillStyle(0x1e293b, 0.6);
        btn.bg.fillRoundedRect(btn.x, btn.y, btn.w, btn.h, 4);
        btn.bg.lineStyle(1, 0x475569, 0.8);
        btn.bg.strokeRoundedRect(btn.x, btn.y, btn.w, btn.h, 4);
        btn.text.setColor('#e2e8f0');
      }
    });
  }

  handleNpcInteraction(npcData) {
    this.currentNpc = npcData;

    // Se o NPC já foi concluído, mostra diretamente sua falaConclusao (SPEC §8)
    if (state.npcsConcluidos.has(npcData.id)) {
      this.isShowingConclusion = true;
      this.nameText.setText(npcData.nome || 'NPC');
      this.labelTag.setText('');
      this.labelTag.setVisible(false);
      this.dialogText.setY(CONFIG.height - 72 - 8 + 26);
      this.dialogText.setText(npcData.falaConclusao || 'Obrigado!');
      this.dialogBox.setVisible(true);
      return;
    }

    // Inicia fluxo normal de novo NPC
    this.isShowingConclusion = false;
    this.falaIndex = 0;
    this.questionIndex = 0;

    // Carrega perguntas deste NPC
    const quizData = this.cache.json.get('quiz_data') || [];
    const perguntasIds = npcData.perguntas || [];
    this.npcQuestions = perguntasIds.map((id) => {
      const question = quizData.find((q) => q.id === id);
      if (!question) {
        throw new Error(`A pergunta "${id}" do NPC "${npcData.id}" não existe em src/data/quiz.json.`);
      }
      if (question.npc !== npcData.id) {
        throw new Error(`A pergunta "${id}" está associada ao NPC "${question.npc}", não "${npcData.id}".`);
      }
      return question;
    });
    if (this.npcQuestions.length === 0) {
      throw new Error(`O NPC "${npcData.id}" precisa ter ao menos uma pergunta.`);
    }

    this.dialogBox.setVisible(true);
    this.showCurrentFala();
  }

  showCurrentFala() {
    if (!this.currentNpc) return;

    const falas = this.currentNpc.falas || [];
    if (this.falaIndex >= falas.length) {
      this.endDialogue();
      return;
    }

    const currentFala = falas[this.falaIndex];
    this.nameText.setText(this.currentNpc.nome || 'NPC');

    if (currentFala.tipo === 'tradicao_oral') {
      this.labelTag.setText('Conta a tradição…');
      this.labelTag.setVisible(true);
      this.dialogText.setY(CONFIG.height - 72 - 8 + 38);
    } else {
      this.labelTag.setText('');
      this.labelTag.setVisible(false);
      this.dialogText.setY(CONFIG.height - 72 - 8 + 26);
    }

    this.dialogText.setText(currentFala.texto);
  }

  advanceDialogue() {
    if (this.isShowingConclusion) {
      this.dialogBox.setVisible(false);
      this.currentNpc = null;
      this.isShowingConclusion = false;
      state.fase = 'EXPLORANDO';
      return;
    }

    this.falaIndex++;
    const falas = this.currentNpc?.falas || [];

    if (this.falaIndex < falas.length) {
      this.showCurrentFala();
    } else {
      this.endDialogue();
    }
  }

  endDialogue() {
    this.dialogBox.setVisible(false);

    // Se houver perguntas, abre a primeira pergunta
    if (this.npcQuestions.length > 0 && this.questionIndex < this.npcQuestions.length) {
      this.openQuiz(this.npcQuestions[this.questionIndex]);
      return;
    }

    this.concludeCurrentNpc();
  }

  openQuiz(question) {
    if (
      !question
      || !Array.isArray(question.alternativas)
      || question.alternativas.length !== 4
      || !Number.isInteger(question.resposta_correta)
      || question.resposta_correta < 0
      || question.resposta_correta > 3
    ) {
      throw new Error('A pergunta do quiz precisa ter quatro alternativas e uma resposta correta válida.');
    }

    state.fase = 'QUIZ';
    this.currentQuestion = question;
    this.selectedOptionIndex = 0;

    const qNum = this.questionIndex + 1;
    const qTotal = this.npcQuestions.length;
    this.quizHeader.setText(`DESAFIO DO QUIZ (${qNum}/${qTotal})`);
    this.questionText.setText(question.pergunta);

    question.alternativas.forEach((altText, idx) => {
      const btn = this.optionButtons[idx];
      if (btn) {
        btn.text.setText(`${idx + 1}. ${altText}`);
      }
    });

    this.renderQuizSelection();
    this.quizContainer.setVisible(true);
  }

  confirmQuizAnswer(index) {
    if (
      state.fase !== 'QUIZ'
      || !this.currentQuestion
      || !Number.isInteger(index)
      || index < 0
      || index >= this.currentQuestion.alternativas.length
    ) {
      return;
    }

    const isCorrect = index === this.currentQuestion.resposta_correta;
    if (isCorrect) {
      state.pontos += CONFIG.pointsPerCorrect;
    }
    this.updateHUD();

    this.quizContainer.setVisible(false);
    this.showFeedback(isCorrect);
  }

  showFeedback(isCorrect) {
    state.fase = 'FEEDBACK';

    if (isCorrect) {
      this.feedbackStatusText.setText(`Correto! (+${CONFIG.pointsPerCorrect} pontos)`);
      this.feedbackStatusText.setColor('#4ade80');
    } else {
      this.feedbackStatusText.setText('Incorreto (+0 pontos)');
      this.feedbackStatusText.setColor('#f87171');
    }

    const correctIndex = this.currentQuestion.resposta_correta;
    const correctText = this.currentQuestion.alternativas[correctIndex];
    this.feedbackCorrectAnswerText.setText(`Resposta certa: ${correctIndex + 1}. ${correctText}`);

    this.feedbackExplanationText.setText(`Explicação:\n${this.currentQuestion.explicacao || ''}`);

    const fonteTitulo = this.currentQuestion.fonte?.titulo;
    this.feedbackSourceText.setText(fonteTitulo ? `Fonte: ${fonteTitulo}` : '');

    this.feedbackContainer.setVisible(true);
  }

  closeFeedback() {
    if (state.fase !== 'FEEDBACK') {
      return;
    }

    this.feedbackContainer.setVisible(false);
    this.questionIndex++;

    // Próxima pergunta do NPC (se houver)
    if (this.questionIndex < this.npcQuestions.length) {
      this.openQuiz(this.npcQuestions[this.questionIndex]);
    } else {
      // Todas as perguntas foram respondidas: conclui o NPC (SPEC §10)
      this.concludeCurrentNpc();
    }
  }

  concludeCurrentNpc() {
    if (this.currentNpc) {
      state.npcsConcluidos.add(this.currentNpc.id);
      this.updateHUD();
      this.game.events.emit('npc:completed', this.currentNpc.id);

      // Exibe a fala de conclusão do NPC
      state.fase = 'DIALOGO';
      this.isShowingConclusion = true;
      this.nameText.setText(this.currentNpc.nome || 'NPC');
      this.labelTag.setText('');
      this.labelTag.setVisible(false);
      this.dialogText.setY(CONFIG.height - 72 - 8 + 26);
      this.dialogText.setText(this.currentNpc.falaConclusao || 'Obrigado por jogar!');
      this.dialogBox.setVisible(true);
    } else {
      state.fase = 'EXPLORANDO';
    }
  }

  update() {
    this.hudContainer.setVisible(state.fase === 'EXPLORANDO');

    if (state.fase === 'DIALOGO') {
      const isInteractJustDown = this.interactKeys.some((k) => Phaser.Input.Keyboard.JustDown(k));
      if (isInteractJustDown) {
        this.advanceDialogue();
      }
    } else if (state.fase === 'QUIZ') {
      this.handleQuizInput();
    } else if (state.fase === 'FEEDBACK') {
      const isInteractJustDown = this.interactKeys.some((k) => Phaser.Input.Keyboard.JustDown(k));
      if (isInteractJustDown) {
        this.closeFeedback();
      }
    }
  }

  handleQuizInput() {
    const upJustDown = this.navKeys.up.some((k) => Phaser.Input.Keyboard.JustDown(k));
    if (upJustDown) {
      this.selectedOptionIndex = (this.selectedOptionIndex + 3) % 4;
      this.renderQuizSelection();
    }

    const downJustDown = this.navKeys.down.some((k) => Phaser.Input.Keyboard.JustDown(k));
    if (downJustDown) {
      this.selectedOptionIndex = (this.selectedOptionIndex + 1) % 4;
      this.renderQuizSelection();
    }

    for (let i = 0; i < 4; i++) {
      const normalKey = this.numberKeys[i];
      const numpadKey = this.numberKeys[i + 4];
      if (Phaser.Input.Keyboard.JustDown(normalKey) || Phaser.Input.Keyboard.JustDown(numpadKey)) {
        this.selectedOptionIndex = i;
        this.renderQuizSelection();
        this.confirmQuizAnswer(i);
        return;
      }
    }

    const isConfirmJustDown = this.interactKeys.some((k) => Phaser.Input.Keyboard.JustDown(k));
    if (isConfirmJustDown) {
      this.confirmQuizAnswer(this.selectedOptionIndex);
    }
  }

  destroy() {
    this.game.events.off('npc:interact', this.handleNpcInteraction, this);
    super.destroy();
  }
}

let API_KEY = "";
let API_URL = "";
let MODEL = "";

let SPEECH_KEY = "";
let SPEECH_REGION = "";
let SPEECH_VOICE = "";

async function carregarConfiguracao() {
  const response = await fetch("keys.json");
  const config = await response.json();

  API_KEY = config.apiKeyAzure;
  API_URL = config.endpointAzure;
  MODEL = config.model;

  SPEECH_KEY = config.speechKey;
  SPEECH_REGION = config.speechRegion;
  SPEECH_VOICE = config.speechVoice;
}

async function enviarMensagem() {
  if (!API_KEY) {
    await carregarConfiguracao();
  }

  const input = document.getElementById("chatInput");
  const messages = document.getElementById("messages");
  const texto = input.value.trim();

  if (texto === "") return;

  messages.innerHTML += `
    <div class="msg user">
      <p>${texto}</p>
    </div>
  `;

  input.value = "";

  messages.innerHTML += `
    <div class="msg ia" id="carregando">
      <div class="avatar">E</div>
      <div>
        <strong>EVORA IA ✨</strong>
        <p>Digitando...</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        input: `
Responda sempre em português do Brasil.
Organize a resposta com:
- título curto
- tópicos
- espaçamento entre seções
- linguagem clara e fácil

Pergunta do usuário: ${texto}
`
      })
    });

    const textoResposta = await response.text();

    if (!textoResposta) {
      throw new Error("A Azure retornou uma resposta vazia.");
    }

    const data = JSON.parse(textoResposta);

    document.getElementById("carregando").remove();

    let resposta = "Não consegui ler a resposta.";

    if (data.output_text) {
      resposta = data.output_text;
    } else if (data.output) {
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const parte of item.content) {
            if (parte.type === "output_text") {
              resposta = parte.text;
            }
          }
        }
      }
    }

    if (data.error) {
      resposta = "Erro da Azure: " + data.error.message;
    }

    messages.innerHTML += `
      <div class="msg ia">
        <div class="avatar">E</div>
        <div>
          <strong>EVORA IA ✨</strong>
          <p>${resposta}</p>
          <small>agora</small>
        </div>
      </div>
    `;

    messages.scrollTop = messages.scrollHeight;

    await falar(resposta);

  } catch (error) {
    const carregando = document.getElementById("carregando");
    if (carregando) carregando.remove();

    messages.innerHTML += `
      <div class="msg ia">
        <div class="avatar">E</div>
        <div>
          <strong>Erro</strong>
          <p>${error.message}</p>
        </div>
      </div>
    `;
  }
}

function novoChat() {
  document.getElementById("messages").innerHTML = `
    <div class="msg ia">
      <div class="avatar">E</div>
      <div>
        <strong>EVORA IA ✨</strong>
        <p>Nova conversa iniciada. Como posso te ajudar?</p>
        <small>agora</small>
      </div>
    </div>
  `;
}

function ouvirMicrofone() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Seu navegador não suporta reconhecimento de voz.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  const botaoMicrofone = document.getElementById("btnMicrofone");

  if (botaoMicrofone) {
    botaoMicrofone.textContent = "🎙️ Ouvindo...";
    botaoMicrofone.disabled = true;
  }

  setTimeout(() => {
    recognition.start();
  }, 300);

  recognition.onresult = function(event) {
    const texto = event.results[0][0].transcript;
    document.getElementById("chatInput").value = texto;

    if (botaoMicrofone) {
      botaoMicrofone.textContent = "🎤";
      botaoMicrofone.disabled = false;
    }

    enviarMensagem();
  };

  recognition.onerror = function(event) {
    if (botaoMicrofone) {
      botaoMicrofone.textContent = "🎤";
      botaoMicrofone.disabled = false;
    }

    if (event.error === "no-speech") {
      alert("Não ouvi nada. Clique no microfone e fale em seguida.");
    } else {
      alert("Erro: " + event.error);
    }
  };

  recognition.onend = function() {
    if (botaoMicrofone) {
      botaoMicrofone.textContent = "🎤";
      botaoMicrofone.disabled = false;
    }
  };
}

async function falar(texto) {
  if (!SPEECH_KEY || !SPEECH_REGION) {
    console.warn("Speech Key ou região não configuradas no keys.json.");
    return;
  }

  const response = await fetch(
    `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3"
      },
      body: `
<speak version="1.0"
xmlns="http://www.w3.org/2001/10/synthesis"
xml:lang="pt-BR">
  <voice name="${SPEECH_VOICE}">
    ${texto}
  </voice>
</speak>`
    }
  );

  const blob = await response.blob();
  const audio = new Audio(URL.createObjectURL(blob));
  audio.play();
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    enviarMensagem();
  }
});
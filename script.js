const API_KEY = "";

const API_URL =
  "";

const MODEL = "gpt-5-mini";

async function enviarMensagem() {
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

    const data = await response.json();

    document.getElementById("carregando").remove();

let resposta = "Não consegui ler a resposta.";

console.log(data);

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

  } catch (error) {
    document.getElementById("carregando").remove();

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

document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    enviarMensagem();
  }
});
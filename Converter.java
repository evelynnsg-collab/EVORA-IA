import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Converter {
    public static void main(String[] args) throws Exception {

        String json = Files.readString(
            Paths.get("faq_senai.json"),
            StandardCharsets.UTF_8
        );

        json = json.trim();

        StringBuilder saida = new StringBuilder();

        String[] blocos = json.split("\\},\\s*\\{");

        for (String bloco : blocos) {
            String pergunta = extrair(bloco, "\"pergunta\"");
            String resposta = extrair(bloco, "\"resposta\"");

            if (!pergunta.isEmpty() && !resposta.isEmpty()) {
                String linha =
                    "{\"messages\":[" +
                    "{\"role\":\"system\",\"content\":\"Você é a EVORA IA, assistente do SENAI-SP. Responda sempre em português do Brasil, de forma clara, objetiva e organizada.\"}," +
                    "{\"role\":\"user\",\"content\":\"" + limpar(pergunta) + "\"}," +
                    "{\"role\":\"assistant\",\"content\":\"" + limpar(resposta) + "\"}" +
                    "]}";

                saida.append(linha).append("\n");
            }
        }

        Files.writeString(
            Paths.get("fine_tuning.jsonl"),
            saida.toString(),
            StandardCharsets.UTF_8
        );

        System.out.println("Arquivo fine_tuning.jsonl criado com sucesso!");
    }

    static String extrair(String texto, String chave) {
        int inicio = texto.indexOf(chave);
        if (inicio == -1) return "";

        inicio = texto.indexOf(":", inicio);
        inicio = texto.indexOf("\"", inicio + 1) + 1;

        int fim = texto.indexOf("\"", inicio);
        while (fim > 0 && texto.charAt(fim - 1) == '\\') {
            fim = texto.indexOf("\"", fim + 1);
        }

        if (fim == -1) return "";

        return texto.substring(inicio, fim);
    }

    static String limpar(String texto) {
        return texto
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "");
    }
}
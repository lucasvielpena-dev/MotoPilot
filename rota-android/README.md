# Rota — App Android Nativo (GPS em Segundo Plano)

Este projeto em `rota-android/` é a versão **100% nativa para Android** (Kotlin + Jetpack Compose) do aplicativo **Rota**, preparada para rodar o odômetro GPS continuamente em segundo plano via **Foreground Service** — mesmo com outros aplicativos abertos em tela dividida (ex.: iFood + iFood) ou com a tela bloqueada.

## Como gerar o APK pelo PC (Android Studio)

1. Baixe os arquivos deste workspace para o seu computador.
2. Abra o **Android Studio** no PC e selecione **Open** apontando para a pasta `rota-android`.
3. Aguarde o Gradle sincronizar as dependências automaticamente.
4. Para instalar direto no celular via cabo USB (com Depuração USB ativada): clique no botão **Run (▶)**.
5. Para gerar o arquivo `.apk` instalável: acesse **Build → Build Bundle(s) / APK(s) → Build APK(s)** e transfira o `app-debug.apk` gerado para o celular.

## Permissões importantes no celular

- **Localização**: escolha **Permitir o tempo todo** quando solicitado (para funcionar sem interrupção em segundo plano).
- **Bateria**: toque no botão **Liberar bateria** no topo do app (ou em Configurações → Aplicativos → Rota → Bateria → **Sem restrições**) para impedir que o sistema encerre o serviço durante entregas longas.

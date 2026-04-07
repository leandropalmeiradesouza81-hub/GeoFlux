package com.geoflux.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun RulesAndTermsScreen() {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        Text("Manual de Mapeamento", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(16.dp))

        RuleItem(
            nr = "1.",
            title = "Posição do Suporte",
            desc = "Seu smartphone deve estar no suporte do painel ou para-brisa, alinhado ao centro, visualizando claramente faixas e placas sem filmar o painel interior."
        )

        RuleItem(
            nr = "2.",
            title = "Dirija Naturalmente",
            desc = "Não altere sua rota apenas para mapear, a menos que sinalizado no mapa. O app fará capturas a cada 5 segundos em segundo plano."
        )

        RuleItem(
            nr = "3.",
            title = "Proteção Anti-Fraude (Banimento)",
            desc = "É expressamente proibido rodar com dois smartphones no mesmo carro, criar rotas em círculos infinitos, ou instalar emuladores de GPS. Tentativas anulam os KMs e bloqueiam o usuário."
        )

        RuleItem(
            nr = "4.",
            title = "Validação Visual do Admin",
            desc = "Só há pagamento de R$ 0,10 após validação da iluminação, limpeza da lente e ausência de chuva pesada (visibilidade zero)."
        )

        Spacer(modifier = Modifier.height(32.dp))
        Text("Termos de Serviço", style = MaterialTheme.typography.titleLarge)
        Text(
            "Ao utilizar o aplicativo GeoFlux, você aceita nossa política de cessão de direitos de imagem geoespacial. O app processará sua localização (Latitude/Longitude) e telemetria inercial. Como intermediários DePIN, nos encarregamos da preservação de privacidade (blur), isentando o motorista de passivos com imagem de terceiros.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

@Composable
fun RuleItem(nr: String, title: String, desc: String) {
    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Row {
            Text(nr, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(8.dp))
            Text(title, fontWeight = FontWeight.Bold)
        }
        Text(
            text = desc, 
            style = MaterialTheme.typography.bodyMedium, 
            modifier = Modifier.padding(start = 24.dp, top = 4.dp),
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Divider(modifier = Modifier.padding(start = 24.dp, top = 12.dp))
    }
}

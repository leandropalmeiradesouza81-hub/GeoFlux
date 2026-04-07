package com.geoflux.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.geoflux.service.ForegroundCaptureService
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GeoFluxDriverMain()
        }
    }

    private fun iniciarJornada() {
        val intent = Intent(this, ForegroundCaptureService::class.java).apply {
            action = ForegroundCaptureService.ACTION_START
        }
        startService(intent)
    }

    private fun pararJornada() {
        val intent = Intent(this, ForegroundCaptureService::class.java).apply {
            action = ForegroundCaptureService.ACTION_STOP
        }
        startService(intent)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeoFluxDriverMain() {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    var isMapping by remember { mutableStateOf(false) }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Spacer(Modifier.height(24.dp))
                Text(
                    "Perfil do Motorista", 
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(16.dp)
                )
                Divider()
                NavigationDrawerItem(label = { Text("Meu Saldo: R$ 14,20") }, selected = false, onClick = {})
                NavigationDrawerItem(label = { Text("Configurações da Câmera") }, selected = false, onClick = {})
                NavigationDrawerItem(label = { Text("Regras de Mapeamento") }, selected = false, onClick = {})
                NavigationDrawerItem(label = { Text("Termo de Contrato") }, selected = false, onClick = {})
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("GeoFlux Rio") },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu Lateral")
                        }
                    }
                )
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Map Placeholder (No app real usa-se o com.google.android.gms.maps.MapFragment ou MapBox)
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Box(contentAlignment = androidx.compose.ui.Alignment.Center) {
                        Text("🗺️ Mapa Rodando (API BeeMaps View)")
                    }
                }

                // Barra Inferior Operacional
                Surface(
                    modifier = Modifier.fillMaxWidth().height(140.dp),
                    shadowElevation = 8.dp
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("KM Válidos: 142 km", style = MaterialTheme.typography.titleMedium)
                            Text("Status: ${if (isMapping) "🔴 EXECUTANDO" else "Aguardando"}")
                        }

                        Button(
                            onClick = { isMapping = !isMapping },
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isMapping) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                            )
                        ) {
                            Text(if (isMapping) "ENCERRAR JORNADA" else "INICIAR MAPEAMENTO EM 2º PLANO")
                        }
                    }
                }
            }
        }
    }
}

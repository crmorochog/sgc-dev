package com.sgc.cmorocho.health;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/api/health/db")
    public String checkDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return "Conexión con SQL Server exitosa: "
                    + connection.getCatalog();
        } catch (SQLException exception) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No fue posible conectar con la base de datos"
            );
        }
    }
}

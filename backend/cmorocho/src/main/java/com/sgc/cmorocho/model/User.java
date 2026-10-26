package com.sgc.cmorocho.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, length = 100)
	private String name;
	
	@Column(nullable = false, unique = true, length = 150)
	private String email;
	
	@Column(nullable = false, length = 255)
	private String password;
	
	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAT;
	
	@PrePersist
	protected void onCreate() {
		if (createdAT == null) {
			createdAT = LocalDateTime.now();
		}
	}

}

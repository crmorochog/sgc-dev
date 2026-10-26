package com.sgc.cmorocho.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgc.cmorocho.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
	
	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email);

}

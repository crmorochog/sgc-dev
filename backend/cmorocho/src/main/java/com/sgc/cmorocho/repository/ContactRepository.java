package com.sgc.cmorocho.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgc.cmorocho.model.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactRepository extends JpaRepository<Contact, Long>{

    Page<Contact> findAllByUserId(Long userId, Pageable pageable);

    @Query("""
        SELECT c FROM Contact c
        WHERE c.userId = :userId
        AND (
            LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(c.company, '')) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        """)
    Page<Contact> searchByUser(
        @Param("userId") Long userId,
        @Param("search") String search,
        Pageable pageable
    );
    
}

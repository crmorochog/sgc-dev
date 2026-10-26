package com.sgc.cmorocho.controller;

import com.sgc.cmorocho.dto.ContactRequest;
import com.sgc.cmorocho.model.Contact;
import com.sgc.cmorocho.model.User;
import com.sgc.cmorocho.repository.UserRepository;
import com.sgc.cmorocho.service.ContactService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {
 
    private final ContactService service;
    private final UserRepository userRepository;

    public ContactController(
            ContactService service,
            UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() ->
                        new NoSuchElementException("Usuario no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Contact create(
            @Valid @RequestBody ContactRequest request,
            Authentication authentication) {

        return service.create(currentUserId(authentication), request);
    }

    @GetMapping
    public Page<Contact> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            Authentication authentication) {

        return service.list(
                currentUserId(authentication),
                search,
                PageRequest.of(
                        page,
                        size,
                        Sort.by("lastName").ascending()
                )
        );
    }

    @GetMapping("/{id}")
    public Contact get(
            @PathVariable Long id,
            Authentication authentication) {

        return service.get(currentUserId(authentication), id);
    }

    @PutMapping("/{id}")
    public Contact update(
            @PathVariable Long id,
            @Valid @RequestBody ContactRequest request,
            Authentication authentication) {

        return service.update(
                currentUserId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            Authentication authentication) {

        service.delete(currentUserId(authentication), id);
    }
    
}

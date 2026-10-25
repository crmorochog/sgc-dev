package com.sgc.cmorocho.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sgc.cmorocho.dto.ContactRequest;
import com.sgc.cmorocho.model.Contact;
import com.sgc.cmorocho.repository.ContactRepository;

import java.util.NoSuchElementException;

@Service
@Transactional
public class ContactService {

    private final ContactRepository repository;

    public ContactService(ContactRepository repository) {
        this.repository = repository;
    }

    public Contact create(Long userId, ContactRequest request) {
        Contact contact = new Contact();
        contact.setUserId(userId);
        applyRequest(contact, request);
        return repository.save(contact);
    }

    @Transactional(readOnly = true)
    public Page<Contact> list(Long userId, String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return repository.findAllByUserId(userId, pageable);
        }

        return repository.searchByUser(userId, search.trim(), pageable);
    }

    @Transactional(readOnly = true)
    public Contact get(Long userId, Long id) {
        return repository.findById(id)
            .filter(contact -> contact.getUserId().equals(userId))
            .orElseThrow(() ->
                new NoSuchElementException("Contacto no encontrado"));
    }

    public Contact update(Long userId, Long id, ContactRequest request) {
        Contact contact = get(userId, id);
        applyRequest(contact, request);
        return repository.save(contact);
    }

    public void delete(Long userId, Long id) {
        repository.delete(get(userId, id));
    }

    private void applyRequest(Contact contact, ContactRequest request) {
        contact.setFirstName(request.firstName().trim());
        contact.setLastName(request.lastName().trim());
        contact.setCompany(request.company());
        contact.setJobTitle(request.jobTitle());
        contact.setNotes(request.notes());
    }
    
}

package com.sgc.cmorocho.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
	    @NotBlank @Size(max = 100) String firstName,
	    @NotBlank @Size(max = 100) String lastName,
	    @Size(max = 150) String company,
	    @Size(max = 150) String jobTitle,
	    String notes) {

}

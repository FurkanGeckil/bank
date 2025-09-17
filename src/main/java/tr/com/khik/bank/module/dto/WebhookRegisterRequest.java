package tr.com.khik.bank.module.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class WebhookRegisterRequest {

    @NotBlank(message = "Consumer name cannot be empty")
    @Size(min = 2, max = 100, message = "Consumer name must be between 2 and 100 characters")
    private String consumerName;

    @NotBlank(message = "Callback URL cannot be empty")
    @Pattern(regexp = "^https?://.*", message = "Callback URL must be a valid HTTP/HTTPS URL")
    @Size(max = 500, message = "Callback URL cannot exceed 500 characters")
    private String callbackUrl;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    public WebhookRegisterRequest() {}

    public WebhookRegisterRequest(String consumerName, String callbackUrl, String description) {
        this.consumerName = consumerName;
        this.callbackUrl = callbackUrl;
        this.description = description;
    }

    // Getters and Setters
    public String getConsumerName() {
        return consumerName;
    }

    public void setConsumerName(String consumerName) {
        this.consumerName = consumerName;
    }

    public String getCallbackUrl() {
        return callbackUrl;
    }

    public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "WebhookRegisterRequest{" +
                "consumerName='" + consumerName + '\'' +
                ", callbackUrl='" + callbackUrl + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}

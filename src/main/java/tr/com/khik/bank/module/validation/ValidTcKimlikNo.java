package tr.com.khik.bank.module.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = TcKimlikNoValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTcKimlikNo {
    String message() default "Invalid TC Kimlik No";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

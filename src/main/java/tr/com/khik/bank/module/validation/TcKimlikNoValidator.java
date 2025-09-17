package tr.com.khik.bank.module.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TcKimlikNoValidator implements ConstraintValidator<ValidTcKimlikNo, String> {
    
    @Override
    public void initialize(ValidTcKimlikNo constraintAnnotation) {
    }
    
    @Override
    public boolean isValid(String tcKimlikNo, ConstraintValidatorContext context) {
        if (tcKimlikNo == null || tcKimlikNo.trim().isEmpty()) {
            return false;
        }
        
        // TC Kimlik No 11 haneli olmalı ve sadece rakam içermeli
        if (!tcKimlikNo.matches("\\d{11}")) {
            return false;
        }
        
        // TC Kimlik No algoritma kontrolü
        return validateTcKimlikNo(tcKimlikNo);
    }
    
    private boolean validateTcKimlikNo(String tcKimlikNo) {
        try {
            int[] digits = new int[11];
            for (int i = 0; i < 11; i++) {
                digits[i] = Integer.parseInt(String.valueOf(tcKimlikNo.charAt(i)));
            }
            
            // İlk hane 0 olamaz
            if (digits[0] == 0) {
                return false;
            }
            
            // 10. hane kontrolü
            int sum1 = 0;
            for (int i = 0; i < 9; i++) {
                sum1 += digits[i];
            }
            int digit10 = sum1 % 10;
            if (digits[9] != digit10) {
                return false;
            }
            
            // 11. hane kontrolü
            int sum2 = 0;
            for (int i = 0; i < 10; i++) {
                sum2 += digits[i];
            }
            int digit11 = sum2 % 10;
            if (digits[10] != digit11) {
                return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

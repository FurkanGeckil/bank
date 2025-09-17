# Multi-platform Dockerfile for Spring Boot application
FROM --platform=$BUILDPLATFORM openjdk:17-jdk

# Set working directory
WORKDIR /app

# Copy the built jar file
COPY target/*.jar app.jar

# Create data directory for H2 database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

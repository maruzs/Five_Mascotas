# Guía Práctica de Datos Estructurados Schema.org (JSON-LD)

Los datos estructurados en formato JSON-LD permiten a los motores de búsqueda tradicionales (Google, Bing) y motores de respuesta por IA (ChatGPT, Perplexity, Gemini) entender la entidad, el propósito y los precios de tu aplicación de forma instantánea.

---

### 1. Esquema para Software SaaS (`SoftwareApplication`)
Inyecta este bloque en el `<head>` de la página de inicio o de producto:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NombreDelSaaS",
  "operatingSystem": "Web, iOS, Android",
  "applicationCategory": "BusinessApplication",
  "description": "Descripción breve y clara de la solución que resuelve tu software.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "120"
  },
  "author": {
    "@type": "Organization",
    "name": "NombreDeTuEmpresa",
    "url": "https://tudominio.cl"
  }
}
</script>
```

---

### 2. Esquema para la Organización / Empresa (`Organization`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NombreDeTuEmpresa",
  "url": "https://tudominio.cl",
  "logo": "https://tudominio.cl/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contacto@tudominio.cl",
    "contactType": "customer support",
    "areaServed": "CL",
    "availableLanguage": ["Spanish", "English"]
  }
}
</script>
```

---

### 3. Esquema de Preguntas Frecuentes (`FAQPage`)
Ideal para activar los desplegables enriquecidos directamente en los resultados de Google:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es NombreDelSaaS y para qué sirve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Es una plataforma web diseñada para resolver el problema X de forma automatizada."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo se protegen mis datos en la plataforma?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Todos los datos se procesan con cifrado TLS 1.3 y se almacenan conforme a la Ley N° 21.719 de Chile y estándares internacionales de privacidad."
      }
    }
  ]
}
</script>
```

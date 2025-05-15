<div align="center">

# Week 11: Frontend Development
</div>

In Week 11, we focused on building the frontend structure of our e-commerce website NextGen Hardware. This marked the transition from planning and design to actual implementation. We started designing the user interface by creating several key pages.

---

## Frontend Pages Created and Their Functionalities

### 🔑 Authentication Page

This page provides forms for user login and registration, ensuring that only registered customers can place orders, add items to the cart, or leave reviews.

### 🏠 Home Page

The Home Page displays featured products and includes a search bar where users can look for specific items. Users can view top selections directly from this page, giving a quick overview of what the shop offers.

### ℹ️ About Page

This page introduces the shop, highlights our specializations, and presents what we offer. It also explains what sets NextGen Hardware apart from other tech-related shops offering similar services.

### 🛍️ Products Page

The Products Page lists all available products. Users can:
    
* Add products to their cart
* Buy now directly from the product list
* Leave reviews by giving star ratings and writing comments about the products

### 🛒 Cart Page

The Cart Page allows users to:

1.  Monitor and manage the products they’ve added
2.  Reserve items for future purchase

### 📞 Contact Page

The Contact Page offers several ways for customers to reach out:

* Users can send a direct message through a form
* They can also call or email the shop for quicker support

### 🚚 Track Order Page

This page enables users to track their purchases by entering their Order Number and Email Address, making it easier for customers to stay updated on the status of their delivery.

### 🚪 Logout Page

This allows users to securely end their session and return to the home or login page.

---

## Alignment with Use Case Diagram and ERD
</div>

Each page developed this week directly reflects key parts of our Use Case Diagram and Entity Relationship Diagram (ERD).

### 🔑 Authentication Page

* Linked to the Customer entity in the ERD
* Handles account creation and login for users

### 🏠 Home Page

* Offers featured product viewing and searching functionality, supporting the Product entity
* Helps users explore the shop easily, tied to the product listing features in the system

### ℹ️ About Page

Provides helpful background information that improves trust and transparency with users.

### 🛍️ Products Page

* Reflects the Product, Category, Order Details, and Customer Reviews (via comments and stars) entities
* Adds interactivity with actions like adding to cart and writing reviews
  
### 🛒 Cart Page

* Directly associated with the Orders and Order Details entities
* Displays real-time product reservations, cart totals, and session management (logout)

### 📞 Contact Page

Enhances user experience and communication, an important support feature mentioned in the use case, though not stored directly in the ERD.

### 🚚 Track Order Page

* Linked to the Shipments and Orders entities
* Allows customers to check the status of their orders based on order number and email

## 📝 Summary

This week’s improvements focused on turning the backend structure into a working user interface. The frontend pages are closely aligned with the Use Case Diagram and ERD, ensuring consistency between what the users see and how data is handled behind the scenes. This sets a solid foundation for integrating backend functionality in the coming week. However, there are still more things that need to be edited and refined in the upcoming week to further improve the system’s design and functionality.

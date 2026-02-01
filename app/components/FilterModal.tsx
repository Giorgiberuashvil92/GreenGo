import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCategories } from "../../hooks/useCategories";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

interface FilterState {
  sortBy: string;
  priceRange: string;
  rating: string;
  deliveryTime: string;
  categories: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "",
    priceRange: "",
    rating: "4.8",
    deliveryTime: "20",
    categories: [],
  });

  // Fetch categories from API
  const { categories, loading: categoriesLoading } = useCategories(true);

  const sortOptions = [
    { id: "closest", label: "უახლოესი" },
    { id: "rating", label: "საუკეთესო რეიტინგი" },
    { id: "fastest", label: "ყველაზე სწრაფი მიტანა" },
    { id: "cheapest", label: "ყველაზე იაფი მიტანა" },
  ];

  const priceOptions = [
    { id: "€", label: "₾" },
    { id: "€€", label: "₾₾" },
    { id: "€€€", label: "₾₾₾" },
  ];

  const ratingOptions = [
    { id: "4.3", label: "⭐ 4.3 ან მეტი" },
    { id: "4.6", label: "⭐ 4.6 ან მეტი" },
    { id: "4.8", label: "⭐ 4.8 ან მეტი" },
  ];

  const deliveryTimeOptions = [
    { id: "15", label: "15 წუთი ან ნაკლები" },
    { id: "20", label: "20 წუთი ან ნაკლები" },
    { id: "35", label: "35 წუთი ან ნაკლები" },
  ];

  // Transform categories from API to filter options
  const categoryOptions = categories.map((category: { _id?: string; id?: string; name: string; icon?: string }) => ({
    id: category._id || category.id || "",
    label: category.icon ? `${category.icon} ${category.name}` : category.name,
  }));

  const handleSortSelect = (sortId: string) => {
    setFilters({ ...filters, sortBy: sortId });
  };

  const handlePriceSelect = (priceId: string) => {
    setFilters({ ...filters, priceRange: priceId });
  };

  const handleRatingSelect = (ratingId: string) => {
    setFilters({ ...filters, rating: ratingId });
  };

  const handleDeliveryTimeSelect = (timeId: string) => {
    setFilters({ ...filters, deliveryTime: timeId });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    setFilters({ ...filters, categories: updatedCategories });
  };

  const handleClearAll = () => {
    setFilters({
      sortBy: "",
      priceRange: "",
      rating: "",
      deliveryTime: "",
      categories: [],
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ფილტრები</Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearText}>გასუფთავება</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Sort Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="swap-vertical" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>სორტირება</Text>
            </View>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.radioOption}
                onPress={() => handleSortSelect(option.id)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                <View style={styles.radioButton}>
                  {filters.sortBy === option.id && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>ფასი</Text>
            </View>
            <View style={styles.buttonGroup}>
              {priceOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.priceButton,
                    filters.priceRange === option.id &&
                      styles.priceButtonSelected,
                  ]}
                  onPress={() => handlePriceSelect(option.id)}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      filters.priceRange === option.id &&
                        styles.priceButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>რეიტინგი</Text>
            </View>
            <View style={styles.buttonGroup}>
              {ratingOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.ratingButton,
                    filters.rating === option.id && styles.ratingButtonSelected,
                  ]}
                  onPress={() => handleRatingSelect(option.id)}
                >
                  <Text
                    style={[
                      styles.ratingButtonText,
                      filters.rating === option.id &&
                        styles.ratingButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Delivery Time Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>მოტანის დრო</Text>
            </View>
            <View style={styles.buttonGroup}>
              {deliveryTimeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.deliveryButton,
                    filters.deliveryTime === option.id &&
                      styles.deliveryButtonSelected,
                  ]}
                  onPress={() => handleDeliveryTimeSelect(option.id)}
                >
                  <Text
                    style={[
                      styles.deliveryButtonText,
                      filters.deliveryTime === option.id &&
                        styles.deliveryButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="grid" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>კატეგორიები</Text>
            </View>
            {categoriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>იტვირთება...</Text>
              </View>
            ) : categoryOptions.length > 0 ? (
              categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.checkboxOption}
                  onPress={() => handleCategoryToggle(option.id)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  <View style={styles.checkbox}>
                    {filters.categories.includes(option.id) && (
                      <Ionicons name="checkmark" size={16} color="#4CAF50" />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>კატეგორიები ვერ მოიძებნა</Text>
            )}
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>ფილტრის გამოყენება</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  priceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8F5E8",
    backgroundColor: "#FFFFFF",
  },
  priceButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  priceButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  priceButtonTextSelected: {
    color: "#FFFFFF",
  },
  ratingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  ratingButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  ratingButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  ratingButtonTextSelected: {
    color: "#FFFFFF",
  },
  deliveryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  deliveryButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  deliveryButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  deliveryButtonTextSelected: {
    color: "#FFFFFF",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
});

export default FilterModal;

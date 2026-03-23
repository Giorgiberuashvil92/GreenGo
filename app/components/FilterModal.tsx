import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCategories } from "../../hooks/useCategories";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  sortBy: string;
  priceRange: string;
  rating: string;
  deliveryTime: string;
  categories: string[];
}

/** მაკეტის აქტიური მუქი მწვანე */
const FILTER_ACTIVE_GREEN = "#14532D";
const PILL_INACTIVE_BG = "#F3F4F6";
const TEXT_PRIMARY = "#181B1A";
const TEXT_MUTED = "#6B7280";
const DIVIDER = "#E8E8E8";
const STAR_GOLD = "#EAB308";

function categoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("მაღაზი") || n.includes("shop")) return "🛍️";
  if (n.includes("ქართულ")) return "🇬🇪";
  if (n.includes("სწრაფი") || n.includes("fast")) return "🍟";
  if (n.includes("შაურმ") || n.includes("shawarma")) return "🌯";
  if (n.includes("პიც")) return "🍕";
  if (n.includes("ბურგერ")) return "🍔";
  if (n.includes("ქათამ") || n.includes("chicken")) return "🍗";
  if (n.includes("დესერტ")) return "🍰";
  if (n.includes("წვნიან") || n.includes("soup")) return "🍜";
  if (n.includes("ცომეულ") || n.includes("pastry")) return "🥐";
  if (n.includes("საუზმე") || n.includes("breakfast")) return "🥪";
  if (n.includes("ვეგეტარ")) return "🥑";
  if (n.includes("ჯანსაღ") || n.includes("healthy")) return "🥗";
  if (n.includes("ყვავილ")) return "💐";
  if (n.includes("კვებ") || n.includes("food")) return "🍽️";
  return "📦";
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "",
    priceRange: "",
    rating: "",
    deliveryTime: "",
    categories: [],
  });

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
    { id: "4.3", afterStar: "4.3 ან მეტი" },
    { id: "4.6", afterStar: "4.6 ან მეტი" },
    { id: "4.8", afterStar: "4.8 ან მეტი" },
  ];

  const deliveryTimeOptions = [
    { id: "15", label: "15 წუთი ან ნაკლები" },
    { id: "20", label: "20 წუთი ან ნაკლები" },
    { id: "35", label: "35 წუთი ან ნაკლები" },
  ];

  const categoryRows = categories.map((c) => ({
    id: c._id || c.id || "",
    name: c.name,
  }));

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
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <View style={styles.headerSide}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.headerIconBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={26} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>ფილტრები</Text>
          <View style={[styles.headerSide, styles.headerSideRight]}>
            <TouchableOpacity
              onPress={handleClearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearText}>გასუფთავება</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* სორტირება */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="swap-vertical" size={20} color={BRAND_GREEN} />
              <Text style={styles.sectionTitle}>სორტირება</Text>
            </View>
            <View style={styles.sectionDivider} />
            {sortOptions.map((option, i) => (
              <View key={option.id}>
                <TouchableOpacity
                  style={styles.sortRow}
                  onPress={() =>
                    setFilters((f) => ({ ...f, sortBy: option.id }))
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.sortLabel}>{option.label}</Text>
                  <View
                    style={[
                      styles.radioOuter,
                      filters.sortBy === option.id && styles.radioOuterActive,
                    ]}
                  >
                    {filters.sortBy === option.id ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </View>
                </TouchableOpacity>
                {i < sortOptions.length - 1 ? (
                  <View style={styles.rowHairline} />
                ) : null}
              </View>
            ))}
          </View>

          {/* ფასი */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIconLari} accessibilityLabel="ლარი">
                ₾
              </Text>
              <Text style={styles.sectionTitle}>ფასი</Text>
            </View>
            <View style={styles.sectionDivider} />
            <View style={styles.pillRow}>
              {priceOptions.map((option) => {
                const on = filters.priceRange === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.compactPill,
                      on ? styles.pillActiveGreen : styles.pricePillIdle,
                    ]}
                    onPress={() =>
                      setFilters((f) => ({
                        ...f,
                        priceRange: on ? "" : option.id,
                      }))
                    }
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.pricePillText,
                        on ? styles.pillTextWhite : styles.pricePillTextIdle,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* რეიტინგი */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="star" size={20} color={BRAND_GREEN} />
              <Text style={styles.sectionTitle}>რეიტინგი</Text>
            </View>
            <View style={styles.sectionDivider} />
            <View style={styles.pillRow}>
              {ratingOptions.map((option) => {
                const on = filters.rating === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.ratingPill,
                      on ? styles.pillActiveGreen : styles.pillGrey,
                    ]}
                    onPress={() =>
                      setFilters((f) => ({
                        ...f,
                        rating: on ? "" : option.id,
                      }))
                    }
                    activeOpacity={0.85}
                  >
                    {on ? (
                      <Text style={styles.ratingPillTextActive}>
                        ★ {option.afterStar}
                      </Text>
                    ) : (
                      <Text style={styles.ratingPillTextRow}>
                        <Text style={styles.ratingStarGold}>★</Text>
                        <Text style={styles.ratingRestDark}>
                          {" "}
                          {option.afterStar}
                        </Text>
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* მოტანის დრო */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="time-outline" size={20} color={BRAND_GREEN} />
              <Text style={styles.sectionTitle}>მოტანის დრო</Text>
            </View>
            <View style={styles.sectionDivider} />
            <View style={styles.pillRow}>
              {deliveryTimeOptions.map((option) => {
                const on = filters.deliveryTime === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.deliveryPill,
                      on ? styles.pillActiveGreen : styles.pillGrey,
                    ]}
                    onPress={() =>
                      setFilters((f) => ({
                        ...f,
                        deliveryTime: on ? "" : option.id,
                      }))
                    }
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.deliveryPillText,
                        on && styles.pillTextWhite,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* კატეგორიები */}
          <View style={[styles.sectionBlock, styles.lastSection]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="grid-outline" size={20} color={BRAND_GREEN} />
              <Text style={styles.sectionTitle}>კატეგორიები</Text>
            </View>
            <View style={styles.sectionDivider} />
            {categoriesLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={BRAND_GREEN} />
                <Text style={styles.loadingText}>იტვირთება...</Text>
              </View>
            ) : categoryRows.length > 0 ? (
              categoryRows.map((row, index) => {
                const selected = filters.categories.includes(row.id);
                return (
                  <View key={row.id}>
                    <TouchableOpacity
                      style={styles.categoryRow}
                      onPress={() =>
                        setFilters((f) => {
                          const next = selected
                            ? f.categories.filter((x) => x !== row.id)
                            : [...f.categories, row.id];
                          return { ...f, categories: next };
                        })
                      }
                      activeOpacity={0.65}
                    >
                      <Text style={styles.categoryEmoji}>
                        {categoryEmoji(row.name)}
                      </Text>
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {row.name}
                      </Text>
                      <View
                        style={[
                          styles.catRadioOuter,
                          selected && styles.catRadioOuterOn,
                        ]}
                      >
                        {selected ? (
                          <View style={styles.catRadioInner} />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                    {index < categoryRows.length - 1 ? (
                      <View style={styles.rowHairlineFull} />
                    ) : null}
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>კატეგორიები ვერ მოიძებნა</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.applyButton,
              { backgroundColor: FILTER_ACTIVE_GREEN },
            ]}
            onPress={handleApply}
            activeOpacity={0.9}
          >
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  headerSide: {
    width: 100,
    justifyContent: "center",
  },
  headerSideRight: {
    alignItems: "flex-end",
    paddingRight: 8,
  },
  headerIconBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 26,
    fontFamily: fontFamily.semiBold,
    color: TEXT_PRIMARY,
    textAlign: "center",
  },
  clearText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: BRAND_GREEN,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionBlock: {
    marginTop: 22,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  sectionIconLari: {
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    color: BRAND_GREEN,
    width: 22,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: TEXT_PRIMARY,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginBottom: 4,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingRight: 4,
  },
  sortLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: TEXT_PRIMARY,
    paddingRight: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioOuterActive: {
    borderColor: FILTER_ACTIVE_GREEN,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: FILTER_ACTIVE_GREEN,
  },
  rowHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginLeft: 0,
  },
  rowHairlineFull: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 12,
    paddingBottom: 4,
  },
  compactPill: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  pricePillIdle: {
    backgroundColor: PILL_INACTIVE_BG,
  },
  pillActiveGreen: {
    backgroundColor: FILTER_ACTIVE_GREEN,
  },
  pricePillText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
  },
  pricePillTextIdle: {
    color: BRAND_GREEN,
  },
  pillGrey: {
    backgroundColor: PILL_INACTIVE_BG,
  },
  ratingPill: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingPillTextActive: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "#FFFFFF",
  },
  ratingPillTextRow: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  ratingStarGold: {
    color: STAR_GOLD,
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  ratingRestDark: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  deliveryPill: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryPillText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: TEXT_PRIMARY,
  },
  pillTextWhite: {
    color: "#FFFFFF",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 4,
  },
  categoryEmoji: {
    fontSize: 22,
    width: 40,
    textAlign: "center",
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: TEXT_PRIMARY,
    marginLeft: 6,
  },
  catRadioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  catRadioOuterOn: {
    borderColor: FILTER_ACTIVE_GREEN,
  },
  catRadioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: FILTER_ACTIVE_GREEN,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: TEXT_MUTED,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: TEXT_MUTED,
    textAlign: "center",
    paddingVertical: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
    backgroundColor: "#FFFFFF",
  },
  applyButton: {
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
  },
});

export default FilterModal;

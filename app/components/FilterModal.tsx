import SortIcon from "@/components/icons/SortIcon";
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

const PILL_INACTIVE_BG = "#F5F5F5";
const TEXT_PRIMARY = "#181B1A";
const DIVIDER = "#E8E8E8";
const STAR_GOLD = "#EAB308";

/** სექციის სათაური — 14px / 600 */
const sectionTitleTypography = {
  color: TEXT_PRIMARY,
  fontFamily: fontFamily.semiBold,
  fontSize: 14,
  lineHeight: 22,
} as const;

/** შიდა აითემი — 12px / 600 */
const innerItemTypography = {
  color: TEXT_PRIMARY,
  fontFamily: fontFamily.semiBold,
  fontSize: 12,
  lineHeight: 22,
} as const;

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
  if (n.includes("წვნიან") || n.includes("soup")) return "🥣";
  if (n.includes("ცომეულ") || n.includes("pastry")) return "🥐";
  if (n.includes("საუზმე") || n.includes("breakfast")) return "🥪";
  if (n.includes("ვეგეტარ")) return "🥑";
  if (n.includes("ჯანსაღ") || n.includes("healthy")) return "🥗";
  if (n.includes("ყვავილ")) return "🌻";
  if (n.includes("ზოო") || n.includes("zoo") || n.includes("pet")) return "🐾";
  if (n.includes("კვებ") || n.includes("food")) return "🍽️";
  return "📦";
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

function RatingPillButton({
  value,
  selected,
  wide,
  onPress,
}: {
  value: string;
  selected: boolean;
  wide?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        wide ? styles.ratingPillWide : styles.ratingPill,
        selected ? styles.pillActive : styles.pillInactive,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.ratingPillInner}>
        <Text
          style={[
            styles.ratingStarText,
            { color: selected ? "#FFFFFF" : STAR_GOLD },
          ]}
        >
          ★
        </Text>
        <Text
          style={[
            styles.ratingPillLabel,
            selected && styles.pillTextWhite,
          ]}
        >
          {value} ან მეტი
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SectionDivider() {
  return <View style={styles.sectionDivider} />;
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
    { id: "closest", label: "უახლოესი  ობიექტი" },
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
    { id: "4.3", value: "4.3" },
    { id: "4.6", value: "4.6" },
    { id: "4.8", value: "4.8" },
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

  const togglePrice = (id: string) => {
    setFilters((f) => ({
      ...f,
      priceRange: f.priceRange === id ? "" : id,
    }));
  };

  const toggleRating = (id: string) => {
    setFilters((f) => ({
      ...f,
      rating: f.rating === id ? "" : id,
    }));
  };

  const toggleDelivery = (id: string) => {
    setFilters((f) => ({
      ...f,
      deliveryTime: f.deliveryTime === id ? "" : id,
    }));
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
          <View style={styles.section}>
            <SectionHeader
              icon={
                <View style={styles.sectionIconGap}>
                  <SortIcon size={16} color={TEXT_PRIMARY} />
                </View>
              }
              title="დალაგება"
            />
            {sortOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortRow,
                  index === sortOptions.length - 1 && styles.sortRowLast,
                ]}
                onPress={() => setFilters((f) => ({ ...f, sortBy: option.id }))}
                activeOpacity={0.7}
              >
                <Text style={styles.sortLabel}>{option.label}</Text>
                <RadioIndicator selected={filters.sortBy === option.id} />
              </TouchableOpacity>
            ))}
          </View>

          <SectionDivider />

          <View style={styles.section}>
            <SectionHeader
              icon={
                <Text style={styles.lariIcon} accessibilityLabel="ლარი">
                  ₾
                </Text>
              }
              title="ფასი"
            />
            <View style={styles.priceRow}>
              {priceOptions.map((option, index) => {
                const on = filters.priceRange === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.pricePill,
                      on && styles.pillActive,
                      index === priceOptions.length - 1 && styles.pricePillLast,
                    ]}
                    onPress={() => togglePrice(option.id)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[styles.pricePillText, on && styles.pillTextWhite]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <SectionDivider />

          <View style={styles.section}>
            <SectionHeader
              icon={
                <Ionicons
                  name="star"
                  size={20}
                  color={BRAND_GREEN}
                  style={styles.sectionIconGapSm}
                />
              }
              title="რეიტინგი"
            />
            <View style={styles.ratingRow}>
              {ratingOptions.slice(0, 2).map((option) => (
                <RatingPillButton
                  key={option.id}
                  value={option.value}
                  selected={filters.rating === option.id}
                  onPress={() => toggleRating(option.id)}
                />
              ))}
            </View>
            <RatingPillButton
              value={ratingOptions[2].value}
              selected={filters.rating === ratingOptions[2].id}
              wide
              onPress={() => toggleRating(ratingOptions[2].id)}
            />
          </View>

          <SectionDivider />

          <View style={styles.section}>
            <SectionHeader
              icon={
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={BRAND_GREEN}
                  style={styles.sectionIconGapSm}
                />
              }
              title="მოტანის დრო"
            />
            <View style={styles.deliveryRow}>
              {deliveryTimeOptions.slice(0, 2).map((option, index) => {
                const on = filters.deliveryTime === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.deliveryPill,
                      on ? styles.pillActive : styles.pillInactive,
                      index === 0 && styles.deliveryPillFirst,
                    ]}
                    onPress={() => toggleDelivery(option.id)}
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
            {(() => {
              const option = deliveryTimeOptions[2];
              const on = filters.deliveryTime === option.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.deliveryPillWide,
                    on ? styles.pillActive : styles.pillInactive,
                  ]}
                  onPress={() => toggleDelivery(option.id)}
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
            })()}
          </View>

          <SectionDivider />

          <View style={styles.sectionLast}>
            <SectionHeader
              icon={
                <Ionicons
                  name="grid-outline"
                  size={20}
                  color={BRAND_GREEN}
                  style={styles.sectionIconGapMd}
                />
              }
              title="კატეგორიები"
            />
            {categoriesLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={BRAND_GREEN} />
                <Text style={styles.loadingText}>იტვირთება...</Text>
              </View>
            ) : categoryRows.length > 0 ? (
              categoryRows.map((row, index) => {
                const selected = filters.categories.includes(row.id);
                return (
                  <TouchableOpacity
                    key={row.id}
                    style={[
                      styles.categoryRow,
                      index === categoryRows.length - 1 &&
                        styles.categoryRowLast,
                    ]}
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
                    <RadioIndicator selected={selected} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>კატეგორიები ვერ მოიძებნა</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
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
    paddingBottom: 12,
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
    ...sectionTitleTypography,
    flex: 1,
    textAlign: "center",
  },
  clearText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: BRAND_GREEN,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginBottom: 16,
  },
  section: {
    paddingBottom: 16,
    marginBottom: 16,
  },
  sectionLast: {
    paddingBottom: 0,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconGap: {
    marginRight: 10,
  },
  sectionIconGapSm: {
    marginRight: 10,
  },
  sectionIconGapMd: {
    marginRight: 10,
  },
  lariIcon: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: fontFamily.semiBold,
    color: BRAND_GREEN,
    width: 22,
    textAlign: "center",
    marginRight: 10,
  },
  sectionTitle: {
    ...sectionTitleTypography,
    flexShrink: 1,
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 12,
  },
  sortRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  sortLabel: {
    ...innerItemTypography,
    flex: 1,
    flexShrink: 1,
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
    borderColor: BRAND_GREEN,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: BRAND_GREEN,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pricePill: {
    backgroundColor: PILL_INACTIVE_BG,
    borderRadius: 60,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginRight: 10,
  },
  pricePillLast: {
    marginRight: 0,
  },
  pricePillText: {
    ...innerItemTypography,
    color: BRAND_GREEN,
  },
  pillInactive: {
    backgroundColor: PILL_INACTIVE_BG,
  },
  pillActive: {
    backgroundColor: BRAND_GREEN,
  },
  pillTextWhite: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 10,
    gap: 10,
  },
  ratingPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 40,
    overflow: "visible",
  },
  ratingPillWide: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
    overflow: "visible",
  },
  ratingPillInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ratingStarText: {
    fontSize: 12,
    lineHeight: 22,
    fontFamily: fontFamily.semiBold,
    marginRight: 4,
  },
  ratingPillLabel: {
    color: TEXT_PRIMARY,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 22,
    flexShrink: 0,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  deliveryPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 40,
  },
  deliveryPillFirst: {
    marginRight: 0,
  },
  deliveryPillWide: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
  },
  deliveryPillText: {
    ...innerItemTypography,
    textAlign: "center",
    flexShrink: 1,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 12,
  },
  categoryRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  categoryEmoji: {
    fontSize: 22,
    width: 36,
    textAlign: "center",
  },
  categoryName: {
    ...innerItemTypography,
    flex: 1,
    flexShrink: 1,
    marginLeft: 4,
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
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    color: "#666666",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    color: "#666666",
    textAlign: "center",
    paddingVertical: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  applyButton: {
    width: "100%",
    maxWidth: 343,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 60,
    backgroundColor: BRAND_GREEN,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

export default FilterModal;

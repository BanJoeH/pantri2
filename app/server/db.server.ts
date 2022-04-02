import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";

// helper function to convert firestore data to typescript
const converter = <T>() => ({
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

// helper to apply converter to multiple collections
const dataPoint = <T>(collectionPath: string) =>
    getFirestore().collection(collectionPath).withConverter(converter<T>());

export type Recipe = {
    id: string;
    title: string;
};

export type ShoppingItem = Recipe

export const db = {
    userRecipes: (uid: string) => dataPoint<Recipe>(`users/${uid}/recipes`),
    userShoppingItems: (uid: string) => dataPoint<Recipe>(`users/${uid}/shoppingList`),
};

export const getUserRecipes = async (uid: string): Promise<Recipe[]> => {
    const recipeSnap = await db.userRecipes(uid).get();
    const recipeData = recipeSnap.docs.map((doc) => doc.data());
    return recipeData;
};

export const addRecipe = async (uid: string, title: string) => {
    const newRecipeRef = db.userRecipes(uid).doc();
    await newRecipeRef.set({ title, id: newRecipeRef.id });
};

export const removeRecipe = async (uid: string, recipeId: string) => {
    await db.userRecipes(uid).doc(recipeId).delete();
};

export const getUserShoppingItems = async (uid: string): Promise<ShoppingItem[]> => {
    const shoppingItemSnap = await db.userShoppingItems(uid).get();
    const shoppingItemData = shoppingItemSnap.docs.map((doc) => doc.data());
    return shoppingItemData;
  };
  
  export const addShoppingItem = async (uid: string, title: string) => {
    const newShoppingItemRef = db.userShoppingItems(uid).doc();
    await newShoppingItemRef.set({ title, id: newShoppingItemRef.id });
  };
  
  export const removeShoppingItem = async (uid: string, shoppingItemId: string) => {
    await db.userShoppingItems(uid).doc(shoppingItemId).delete();
  };
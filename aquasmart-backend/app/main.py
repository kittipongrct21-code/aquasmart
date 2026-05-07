import io
import os
import json
import uuid
from typing import Optional

import numpy as np
import tensorflow as tf
from PIL import Image
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "fish-images")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

MODEL_PATH = "models/fish_model_inference.keras"
CLASS_NAMES_PATH = "models/class_names.json"
IMG_SIZE = (224, 224)

model = None
class_names: list[str] = []
model_load_error: Optional[str] = None

try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        class_names = json.load(f)
    print("Model loaded successfully")
except Exception as e:
    model_load_error = str(e)
    print("WARNING: model load failed:", model_load_error)

app = FastAPI(title="AquaSmart ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FishGeneralSchema(BaseModel):
    name: str
    slug: str
    short_description: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    habitat: Optional[str] = None
    origin: Optional[str] = None
    identify_text: Optional[str] = None
    average_lifespan: Optional[str] = None
    adult_size: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_active: bool = True


class FishFarmerSchema(BaseModel):
    how_to_raise: Optional[str] = None
    pond_type: Optional[str] = None
    pond_size: Optional[str] = None
    population_per_pond: Optional[str] = None
    water_temp: Optional[str] = None
    ph: Optional[str] = None
    water_prep: Optional[str] = None
    source_type: Optional[str] = None
    source_size: Optional[str] = None
    system_type: Optional[str] = None
    compatible_species: Optional[str] = None
    incompatible_species: Optional[str] = None
    growth_rate: Optional[str] = None
    survival_rate: Optional[str] = None
    common_diseases: Optional[str] = None
    disease_prevention: Optional[str] = None
    recommended_food: Optional[str] = None
    not_recommended_food: Optional[str] = None
    feeding_amount: Optional[str] = None
    feeding_frequency: Optional[str] = None
    notes: Optional[str] = None


class FishOrnamentalSchema(BaseModel):
    environment: Optional[str] = None
    population: Optional[str] = None
    water_temp: Optional[str] = None
    ph: Optional[str] = None
    preparation: Optional[str] = None
    source_type: Optional[str] = None
    source_size: Optional[str] = None
    system_type: Optional[str] = None
    compatible_species: Optional[str] = None
    incompatible_species: Optional[str] = None
    growth_rate: Optional[str] = None
    survival_rate: Optional[str] = None
    common_diseases: Optional[str] = None
    disease_prevention: Optional[str] = None
    recommended_food: Optional[str] = None
    not_recommended_food: Optional[str] = None
    feeding_amount: Optional[str] = None
    feeding_frequency: Optional[str] = None
    notes: Optional[str] = None

class FishPayload(BaseModel):
    general: FishGeneralSchema
    farmer: Optional[FishFarmerSchema] = None
    ornamental: Optional[FishOrnamentalSchema] = None


class FishImagePayload(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    is_cover: bool = False


def preprocess_image(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    arr = np.array(image).astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr


def parse_public_url(value):
    if isinstance(value, str):
        return value

    if isinstance(value, dict):
        return (
            value.get("publicURL")
            or value.get("publicUrl")
            or (value.get("data") or {}).get("publicUrl")
            or (value.get("data") or {}).get("publicURL")
        )

    return None


def get_fish_full_detail_by_id(fish_id: int):
    fish = (
        supabase.table("fish_species")
        .select("*")
        .eq("id", fish_id)
        .maybe_single()
        .execute()
    )

    if not fish.data:
        return None

    farmer = (
        supabase.table("fish_farmer_info")
        .select("*")
        .eq("fish_id", fish_id)
        .maybe_single()
        .execute()
    )

    ornamental = (
        supabase.table("fish_ornamental_info")
        .select("*")
        .eq("fish_id", fish_id)
        .maybe_single()
        .execute()
    )

    images = (
        supabase.table("fish_images")
        .select("*")
        .eq("fish_id", fish_id)
        .order("id")
        .execute()
    )

    return {
        "fish": fish.data,
        "farmer_info": farmer.data,
        "ornamental_info": ornamental.data,
        "images": images.data,
    }


def upsert_cover_image(
    fish_id: int,
    image_url: str | None,
    fish_name: str | None = None,
):
    if not image_url:
        (
            supabase.table("fish_images")
            .delete()
            .eq("fish_id", fish_id)
            .eq("is_cover", True)
            .execute()
        )
        (
            supabase.table("fish_species")
            .update({"cover_image_url": None})
            .eq("id", fish_id)
            .execute()
        )
        return

    payload = {
        "fish_id": fish_id,
        "image_url": image_url,
        "alt_text": f"{fish_name} cover" if fish_name else "Fish cover",
        "is_cover": True,
    }

    existing_cover = (
        supabase.table("fish_images")
        .select("id")
        .eq("fish_id", fish_id)
        .eq("is_cover", True)
        .limit(1)
        .execute()
    )

    existing_rows = existing_cover.data or []

    if existing_rows:
        cover_id = existing_rows[0]["id"]
        (
            supabase.table("fish_images")
            .update(payload)
            .eq("id", cover_id)
            .execute()
        )
    else:
        supabase.table("fish_images").insert(payload).execute()

    (
        supabase.table("fish_species")
        .update({"cover_image_url": image_url})
        .eq("id", fish_id)
        .execute()
    )


def set_cover_image_for_fish(fish_id: int, image_id: int, image_url: str):
    (
        supabase.table("fish_images")
        .update({"is_cover": False})
        .eq("fish_id", fish_id)
        .execute()
    )

    (
        supabase.table("fish_images")
        .update({"is_cover": True})
        .eq("id", image_id)
        .execute()
    )

    (
        supabase.table("fish_species")
        .update({"cover_image_url": image_url})
        .eq("id", fish_id)
        .execute()
    )


@app.get("/")
def root():
    return {"message": "AquaSmart ML API is running"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_error": model_load_error,
    }


@app.get("/fish")
def get_fish(q: Optional[str] = None):
    query = (
        supabase.table("fish_species")
        .select("*")
        .eq("is_active", True)
        .order("id")
    )

    if q:
        keyword = q.strip()
        if keyword:
            query = query.or_(f"name.ilike.%{keyword}%,slug.ilike.%{keyword}%")

    response = query.execute()
    return {"data": response.data}


@app.get("/fish/{fish_id}")
def get_public_fish_by_id(fish_id: int):
    data = get_fish_full_detail_by_id(fish_id)
    if not data:
        raise HTTPException(status_code=404, detail="Fish not found")

    if not data["fish"].get("is_active"):
        raise HTTPException(status_code=404, detail="Fish not found")

    return data


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model is not available: {model_load_error}",
        )

    if not class_names:
        raise HTTPException(status_code=503, detail="Class names are not available")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    input_array = preprocess_image(image)
    preds = model.predict(input_array, verbose=0)[0]

    pred_index = int(np.argmax(preds))
    pred_class = class_names[pred_index]
    confidence = float(preds[pred_index])

    return {
        "predicted_class": pred_class,
        "confidence_percent": round(confidence * 100, 2),
        "all_probabilities": {
            class_names[i]: round(float(preds[i]), 6)
            for i in range(len(class_names))
        },
    }


@app.get("/admin/fish")
def admin_get_fish(
    q: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    fish_type: Optional[str] = None,
):
    query = supabase.table("fish_species").select("*").order("id")

    if q:
        keyword = q.strip()
        if keyword:
            query = query.or_(f"name.ilike.%{keyword}%,slug.ilike.%{keyword}%")

    if status == "active":
        query = query.eq("is_active", True)
    elif status == "inactive":
        query = query.eq("is_active", False)

    if category:
        query = query.ilike("category", f"%{category.strip()}%")

    if fish_type:
        query = query.ilike("type", f"%{fish_type.strip()}%")

    response = query.execute()
    return {"data": response.data}


@app.get("/admin/fish/{fish_id}")
def admin_get_fish_by_id(fish_id: int):
    data = get_fish_full_detail_by_id(fish_id)
    if not data:
        raise HTTPException(status_code=404, detail="Fish not found")
    return data


@app.post("/admin/fish")
def admin_create_fish(payload: FishPayload):
    general_data = payload.general.model_dump()

    fish_response = supabase.table("fish_species").insert(general_data).execute()

    if not fish_response.data:
        raise HTTPException(status_code=400, detail="Failed to create fish")

    fish = fish_response.data[0]
    fish_id = fish["id"]

    if payload.farmer:
        farmer_data = payload.farmer.model_dump()
        farmer_data["fish_id"] = fish_id
        supabase.table("fish_farmer_info").insert(farmer_data).execute()

    if payload.ornamental:
        ornamental_data = payload.ornamental.model_dump()
        ornamental_data["fish_id"] = fish_id
        supabase.table("fish_ornamental_info").insert(ornamental_data).execute()

    upsert_cover_image(
        fish_id=fish_id,
        image_url=general_data.get("cover_image_url"),
        fish_name=general_data.get("name"),
    )

    return {
        "message": "Fish created successfully",
        "data": get_fish_full_detail_by_id(fish_id),
    }


@app.put("/admin/fish/{fish_id}")
def admin_update_fish(fish_id: int, payload: FishPayload):
    existing = (
        supabase.table("fish_species")
        .select("id")
        .eq("id", fish_id)
        .maybe_single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Fish not found")

    general_data = payload.general.model_dump()
    supabase.table("fish_species").update(general_data).eq("id", fish_id).execute()

    if payload.farmer:
        farmer_data = payload.farmer.model_dump()
        farmer_data["fish_id"] = fish_id

        farmer_check = (
            supabase.table("fish_farmer_info")
            .select("id")
            .eq("fish_id", fish_id)
            .maybe_single()
            .execute()
        )

        if farmer_check.data:
            (
                supabase.table("fish_farmer_info")
                .update(farmer_data)
                .eq("fish_id", fish_id)
                .execute()
            )
        else:
            supabase.table("fish_farmer_info").insert(farmer_data).execute()

    if payload.ornamental:
        ornamental_data = payload.ornamental.model_dump()
        ornamental_data["fish_id"] = fish_id

        ornamental_check = (
            supabase.table("fish_ornamental_info")
            .select("id")
            .eq("fish_id", fish_id)
            .maybe_single()
            .execute()
        )

        if ornamental_check.data:
            (
                supabase.table("fish_ornamental_info")
                .update(ornamental_data)
                .eq("fish_id", fish_id)
                .execute()
            )
        else:
            supabase.table("fish_ornamental_info").insert(ornamental_data).execute()

    upsert_cover_image(
        fish_id=fish_id,
        image_url=general_data.get("cover_image_url"),
        fish_name=general_data.get("name"),
    )

    return {
        "message": "Fish updated successfully",
        "data": get_fish_full_detail_by_id(fish_id),
    }


@app.patch("/admin/fish/{fish_id}/status")
def admin_toggle_fish_status(fish_id: int):
    existing = (
        supabase.table("fish_species")
        .select("id, is_active")
        .eq("id", fish_id)
        .maybe_single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Fish not found")

    new_status = not bool(existing.data.get("is_active"))

    updated = (
        supabase.table("fish_species")
        .update({"is_active": new_status})
        .eq("id", fish_id)
        .execute()
    )

    return {
        "message": "Fish status updated successfully",
        "data": updated.data[0] if updated.data else {
            "id": fish_id,
            "is_active": new_status,
        },
    }


@app.delete("/admin/fish/{fish_id}")
def admin_delete_fish(fish_id: int):
    existing = (
        supabase.table("fish_species")
        .select("id")
        .eq("id", fish_id)
        .maybe_single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Fish not found")

    supabase.table("fish_images").delete().eq("fish_id", fish_id).execute()
    supabase.table("fish_farmer_info").delete().eq("fish_id", fish_id).execute()
    supabase.table("fish_ornamental_info").delete().eq("fish_id", fish_id).execute()
    supabase.table("fish_species").delete().eq("id", fish_id).execute()

    return {"message": "Fish deleted successfully"}


@app.post("/admin/upload-image")
async def admin_upload_image(file: UploadFile = File(...)):
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are allowed",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    ext = allowed_types[file.content_type]
    file_name = f"{uuid.uuid4().hex}{ext}"
    file_path = f"fish-covers/{file_name}"

    try:
        supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
            path=file_path,
            file=contents,
            file_options={
                "content-type": file.content_type,
                "upsert": "true",
            },
        )

        public_url = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(file_path)
        public_url = parse_public_url(public_url)

        return {
            "message": "Image uploaded successfully",
            "bucket": SUPABASE_STORAGE_BUCKET,
            "path": file_path,
            "public_url": public_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/admin/fish/{fish_id}/images")
def admin_get_fish_images(fish_id: int):
    response = (
        supabase.table("fish_images")
        .select("*")
        .eq("fish_id", fish_id)
        .order("id")
        .execute()
    )
    return {"data": response.data}


@app.post("/admin/fish/{fish_id}/images")
def admin_add_fish_image(fish_id: int, payload: FishImagePayload):
    fish = (
        supabase.table("fish_species")
        .select("id")
        .eq("id", fish_id)
        .maybe_single()
        .execute()
    )

    if not fish.data:
        raise HTTPException(status_code=404, detail="Fish not found")

    insert_payload = {
        "fish_id": fish_id,
        "image_url": payload.image_url,
        "alt_text": payload.alt_text or "Fish image",
        "is_cover": payload.is_cover,
    }

    image_response = (
        supabase.table("fish_images")
        .insert(insert_payload)
        .execute()
    )

    if not image_response.data:
        raise HTTPException(status_code=400, detail="Failed to add image")

    image = image_response.data[0]

    if payload.is_cover:
        set_cover_image_for_fish(
            fish_id=fish_id,
            image_id=image["id"],
            image_url=image["image_url"],
        )

    return {"message": "Image added successfully", "data": image}


@app.put("/admin/fish/images/{image_id}/cover")
def admin_set_fish_cover(image_id: int):
    image = (
        supabase.table("fish_images")
        .select("*")
        .eq("id", image_id)
        .maybe_single()
        .execute()
    )

    if not image.data:
        raise HTTPException(status_code=404, detail="Image not found")

    set_cover_image_for_fish(
        fish_id=image.data["fish_id"],
        image_id=image.data["id"],
        image_url=image.data["image_url"],
    )

    return {"message": "Cover image updated successfully"}


@app.delete("/admin/fish/images/{image_id}")
def admin_delete_fish_image(image_id: int):
    image = (
        supabase.table("fish_images")
        .select("*")
        .eq("id", image_id)
        .maybe_single()
        .execute()
    )

    if not image.data:
        raise HTTPException(status_code=404, detail="Image not found")

    fish_id = image.data["fish_id"]
    was_cover = bool(image.data.get("is_cover"))

    supabase.table("fish_images").delete().eq("id", image_id).execute()

    if was_cover:
        remaining = (
            supabase.table("fish_images")
            .select("*")
            .eq("fish_id", fish_id)
            .order("id")
            .limit(1)
            .execute()
        )

        remaining_rows = remaining.data or []

        if remaining_rows:
            first_image = remaining_rows[0]
            set_cover_image_for_fish(
                fish_id=fish_id,
                image_id=first_image["id"],
                image_url=first_image["image_url"],
            )
        else:
            (
                supabase.table("fish_species")
                .update({"cover_image_url": None})
                .eq("id", fish_id)
                .execute()
            )

    return {"message": "Image deleted successfully"}
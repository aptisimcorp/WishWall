import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth, SignupData } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Calendar,
  Upload,
  User,
  Mail,
  Lock,
  Briefcase,
  Users,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function Signup() {
  const { signup, loading } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthday: "",
    personalAnniversary: "",
    workAnniversary: "",
    department: "",
    team: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [errors, setErrors] = useState<Partial<SignupData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }
    if (!formData.birthday) newErrors.birthday = "Birthday is required";
    if (!formData.workAnniversary)
      newErrors.workAnniversary = "Work anniversary is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    try {
      await signup({
        ...formData,
        profilePhoto: profilePhoto || undefined,
      });
      showSuccess("Account created successfully! Welcome to WishBoard! 🎉");
    } catch (error) {
      showError("Failed to create account. Please try again.");
    }
  };

  const handleInputChange =
    (field: keyof SignupData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Floating confetti elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CardTitle className="text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Join WishBoard! 🎉
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Create your account to start celebrating with your team
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {photoPreview ? (
                    <ImageWithFallback
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200">
                      <User className="w-8 h-8 text-purple-400" />
                    </div>
                  )}
                  <Label
                    htmlFor="photo-upload"
                    className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-2 rounded-full cursor-pointer hover:bg-purple-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <Label className="text-sm text-gray-600">
                  Upload your profile picture
                </Label>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Work Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500">
                  Must be at least 4 characters long
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Birthday *
                  </Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange("birthday")}
                    className={errors.birthday ? "border-red-500" : ""}
                  />
                  {errors.birthday && (
                    <p className="text-sm text-red-500">{errors.birthday}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workAnniversary">Work Anniversary *</Label>
                  <Input
                    id="workAnniversary"
                    type="date"
                    value={formData.workAnniversary}
                    onChange={handleInputChange("workAnniversary")}
                    className={errors.workAnniversary ? "border-red-500" : ""}
                  />
                  {errors.workAnniversary && (
                    <p className="text-sm text-red-500">
                      {errors.workAnniversary}
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Anniversary */}
              <div className="space-y-2">
                <Label htmlFor="personalAnniversary">
                  Personal Anniversary (Optional)
                </Label>
                <Input
                  id="personalAnniversary"
                  type="date"
                  value={formData.personalAnniversary}
                  onChange={handleInputChange("personalAnniversary")}
                />
                <p className="text-xs text-gray-500">
                  Wedding, relationship, or other personal milestone
                </p>
              </div>

              {/* Department and Team */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="department"
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Engineering"
                    value={formData.department}
                    onChange={handleInputChange("department")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team
                  </Label>
                  <Input
                    id="team"
                    type="text"
                    placeholder="Frontend"
                    value={formData.team}
                    onChange={handleInputChange("team")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg"
              >
                {loading ? "Creating Account..." : "Create Account 🚀"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

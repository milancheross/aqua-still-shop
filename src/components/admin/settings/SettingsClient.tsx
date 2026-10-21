"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Building2,
  Truck,
  Mail,
  Layers,
  Globe,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { type SystemSettingsValues, validateSystemSettings } from "@/lib/settings-validations";
import { saveSystemSettingsAction } from "@/actions/settings-actions";
import GeneralSettingsTab from "./GeneralSettingsTab";
import ShippingPaymentTab from "./ShippingPaymentTab";
import EmailSmtpTab from "./EmailSmtpTab";
import IntegrationsTab from "./IntegrationsTab";
import SeoSettingsTab from "./SeoSettingsTab";
import MaintenanceTab from "./MaintenanceTab";

type TabId = "general" | "shipping" | "email" | "integrations" | "seo" | "maintenance";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: (keyof SystemSettingsValues)[];
}

const TABS: TabConfig[] = [
  {
    id: "general",
    label: "Osnovni podaci",
    icon: Building2,
    fields: [
      "storeName",
      "legalName",
      "pib",
      "registrationNumber",
      "address",
      "city",
      "postalCode",
      "country",
      "phone",
      "email",
      "supportEmail",
      "workingHours",
      "bankAccount",
      "currency",
      "locale",
      "timezone",
    ],
  },
  {
    id: "shipping",
    label: "Dostava i plaćanje",
    icon: Truck,
    fields: [
      "shippingPrice",
      "freeShippingThreshold",
      "enableFreeShipping",
      "allowStorePickup",
      "cashOnDeliveryEnabled",
      "wireTransferEnabled",
      "cardPaymentEnabled",
    ],
  },
  {
    id: "email",
    label: "E-pošta i SMTP",
    icon: Mail,
    fields: [
      "smtpHost",
      "smtpPort",
      "smtpUser",
      "smtpSecure",
      "senderEmail",
      "senderName",
      "replyToEmail",
      "newSmtpPassword",
    ],
  },
  {
    id: "integrations",
    label: "Integracije",
    icon: Layers,
    fields: ["googleAnalyticsId", "metaPixelId"],
  },
  {
    id: "seo",
    label: "SEO i deljenje",
    icon: Globe,
    fields: ["defaultSeoTitle", "defaultSeoDescription", "defaultOgImage", "siteShareName"],
  },
  {
    id: "maintenance",
    label: "Održavanje",
    icon: ShieldAlert,
    fields: ["maintenanceMode", "maintenanceNotice"],
  },
];

interface SettingsClientProps {
  initialSettings: SystemSettingsValues;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [initialValues, setInitialValues] = useState<SystemSettingsValues>(initialSettings);
  const [values, setValues] = useState<SystemSettingsValues>(initialSettings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(
    initialSettings.updatedAt ? new Date(initialSettings.updatedAt).toLocaleString("sr-RS") : null
  );
  const [isPending, startTransition] = useTransition();

  // Detekcija promena u odnosu na sačuvane vrednosti
  const isDirty = React.useMemo(() => {
    const keys = Object.keys(values) as (keyof SystemSettingsValues)[];
    for (const key of keys) {
      if (key === "newSmtpPassword" && values[key]) return true;
      if (key === "clearSmtpPassword" && values[key]) return true;
      if (key !== "newSmtpPassword" && key !== "clearSmtpPassword") {
        if (values[key] !== initialValues[key]) return true;
      }
    }
    return false;
  }, [values, initialValues]);

  // Upozorenje na izlaz iz browsera ukoliko postoje nesnimljene izmene
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Imate nesnimljene izmene. Da li ste sigurni da želite da napustite stranicu?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Rukovanje izmenama pojedinačnih polja
  const handleChange = <K extends keyof SystemSettingsValues>(name: K, value: SystemSettingsValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Ukloni grešku za izmenjeno polje ako je postojala
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (statusMessage) {
      setStatusMessage(null);
    }
  };

  // Validacija pre slanja
  const handleSave = () => {
    const validation = validateSystemSettings(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      setStatusMessage({
        type: "error",
        text: "Ispravite označena polja pre čuvanja podešavanja.",
      });

      // Pronađi prvi tab sa greškom i prebaci na njega
      for (const tab of TABS) {
        if (tab.fields.some((f) => validation.errors[f])) {
          setActiveTab(tab.id);
          break;
        }
      }
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveSystemSettingsAction(values, initialValues.version);
        if (result.success && result.data) {
          setInitialValues(result.data);
          setValues(result.data);
          setErrors({});
          const nowStr = new Date().toLocaleString("sr-RS");
          setLastSavedTime(nowStr);
          setStatusMessage({
            type: "success",
            text: "Podešavanja su uspešno sačuvana.",
          });
        } else if (result.versionMismatch) {
          setStatusMessage({
            type: "warning",
            text: result.error || "Podešavanja su u međuvremenu izmenjena na drugom mestu. Osvežite stranicu.",
          });
        } else {
          if (result.fieldErrors) {
            setErrors(result.fieldErrors);
          }
          setStatusMessage({
            type: "error",
            text: result.error || "Čuvanje podešavanja nije uspelo.",
          });
        }
      } catch (err: unknown) {
        setStatusMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Došlo je do sistemske greške prilikom čuvanja.",
        });
      }
    });
  };

  // Izračunaj status konfiguracije
  const isFullyConfigured =
    values.storeName.trim().length > 0 &&
    values.pib.trim().length > 0 &&
    values.address.trim().length > 0 &&
    values.phone.trim().length > 0 &&
    values.email.trim().length > 0;

  // Izračunaj broj grešaka po tabu
  const getTabErrorCount = (tab: TabConfig) => {
    return tab.fields.filter((field) => Boolean(errors[field])).length;
  };

  return (
    <div className="space-y-6">
      {/* GLAVNO ZAGLAVLJE MODULA */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Podešavanja sistema</h1>
            {isFullyConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Konfigurisano
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Potrebna konfiguracija
              </span>
            )}
            {values.maintenanceMode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                Režim održavanja aktivan
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Centralizovano upravljanje konfiguracijom webshopa, dostavom, e-poštom, integracijama i režimom održavanja.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            {lastSavedTime && (
              <span>Poslednje čuvanje: <strong className="text-slate-600 font-medium">{lastSavedTime}</strong></span>
            )}
            {isDirty && (
              <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                Imate nesnimljene izmene
              </span>
            )}
          </div>
        </div>

        {/* GLAVNO DUGME ZA ČUVANJE */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isPending}
            className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 ${
              !isDirty || isPending
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                : "bg-[#F37021] text-white hover:bg-[#e06114] hover:shadow-orange-200 active:scale-95"
            }`}
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Čuvanje u toku...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sačuvaj promene
              </>
            )}
          </button>
        </div>
      </div>

      {/* STATUS OBAVEŠTENJE */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : statusMessage.type === "warning"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {statusMessage.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />}
            {statusMessage.type === "error" && <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          {statusMessage.type === "warning" && (
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
            >
              Osveži stranicu
            </button>
          )}
        </div>
      )}

      {/* RADNI PROSTOR: TAB NAVIGACIJA + SADRŽAJ TABOVA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* BOČNA NAVIGACIJA TABOVA */}
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-3 shadow-sm overflow-hidden">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const errCount = getTabErrorCount(tab);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 whitespace-nowrap lg:whitespace-normal w-full text-left ${
                    isActive
                      ? "bg-[#0a2540] text-white shadow-sm shadow-slate-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#F37021]" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </div>
                  {errCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-red-500 text-white ml-2">
                      {errCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* SADRŽAJ AKTIVNOG TABA */}
        <main className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          {activeTab === "general" && (
            <GeneralSettingsTab values={values} errors={errors} onChange={handleChange} />
          )}

          {activeTab === "shipping" && (
            <ShippingPaymentTab values={values} errors={errors} onChange={handleChange} />
          )}

          {activeTab === "email" && (
            <EmailSmtpTab values={values} errors={errors} onChange={handleChange} />
          )}

          {activeTab === "integrations" && (
            <IntegrationsTab values={values} errors={errors} onChange={handleChange} />
          )}

          {activeTab === "seo" && (
            <SeoSettingsTab values={values} errors={errors} onChange={handleChange} />
          )}

          {activeTab === "maintenance" && (
            <MaintenanceTab values={values} errors={errors} onChange={handleChange} />
          )}

          {/* DONJA TRAKA ZA ČUVANJE UNUTAR FORME */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              {isDirty ? (
                <span className="text-amber-600 font-medium">Postoje nesačuvane promene u ovom modulu.</span>
              ) : (
                <span>Sve izmene su sinhronizovane sa bazom.</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isPending}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                !isDirty || isPending
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-[#F37021] text-white hover:bg-[#e06114] shadow-sm active:scale-95"
              }`}
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sačuvaj podešavanja
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

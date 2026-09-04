import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { PropertyTinderDeck } from './components/PropertyTinderDeck';
import { PriceMonitor } from './components/PriceMonitor';
import { ValuationDashboard } from './components/ValuationDashboard';
import { AgentAssignmentModal } from './components/AgentAssignmentModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AssignedAgentView } from './components/AssignedAgentView';
import {
  INITIAL_CUSTOMER,
  PROPERTIES_DATA,
  INITIAL_NOTIFICATIONS,
} from './data/singaporePropertyData';
import { CustomerProfile, PropertyCard, AlertNotification, AgentProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tinder' | 'monitor' | 'valuation' | 'agent'>('tinder');
  const [customer, setCustomer] = useState<CustomerProfile>(INITIAL_CUSTOMER);
  const [properties, setProperties] = useState<PropertyCard[]>(PROPERTIES_DATA);
  const [shortlisted, setShortlisted] = useState<PropertyCard[]>(() => {
    return PROPERTIES_DATA.filter((p) => customer.watchlistedPropertyIds.includes(p.id));
  });
  const [notifications, setNotifications] = useState<AlertNotification[]>(INITIAL_NOTIFICATIONS);

  // Modal toggles
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Recalculate match scores when customer parameters change
  const handleSaveCustomer = (updated: CustomerProfile) => {
    setCustomer(updated);

    // Compute updated scores based on target budget, profit target, and locations
    const updatedProperties = properties.map((prop) => {
      let score = 70;
      if (updated.wishlist.targetLocations.includes(prop.town)) score += 15;
      if (updated.wishlist.targetTypes.includes(prop.type)) score += 10;
      if (prop.price <= updated.wishlist.maxBudget) score += 5;
      return {
        ...prop,
        matchScore: Math.min(99, score),
      };
    });

    setProperties(updatedProperties);
  };

  const handleShortlistProperty = (property: PropertyCard) => {
    if (!shortlisted.some((p) => p.id === property.id)) {
      setShortlisted((prev) => [property, ...prev]);

      // If it's a high profit match, notify
      const newNotif: AlertNotification = {
        id: `alert-${Date.now()}`,
        timestamp: 'Just now',
        title: `⚡ Shortlisted: ${property.name}`,
        message: `Added to your Property Tinder deck! Projected MOP capital gain of +S$${property.projectedMOPUpside.toLocaleString()} meets your profit criteria.`,
        type: property.type === 'bto' ? 'bto_launch_match' : 'ec_launch_match',
        relatedPropertyId: property.id,
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handlePassProperty = (property: PropertyCard) => {
    // Optionally log or track pass
  };

  const handleAssignAgent = (agent: AgentProfile, appointmentDetails?: string) => {
    setCustomer((prev) => ({
      ...prev,
      assignedAgent: agent,
      agentStatus: 'assigned',
    }));

    const newNotif: AlertNotification = {
      id: `alert-${Date.now()}`,
      timestamp: 'Just now',
      title: `👔 Agent Assigned: ${agent.name}`,
      message: `${agent.name} (${agent.agency}, CEA: ${agent.ceaRegNo}) is assigned to your property at ${customer.currentProperty.address}. Initial on-site inspection scheduled: ${appointmentDetails || 'Upcoming'}.`,
      type: 'agent_assigned',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationAction = (notification: AlertNotification) => {
    setIsNotificationsModalOpen(false);
    if (notification.type === 'agent_assigned') {
      setActiveTab('agent');
    } else if (notification.type === 'profit_target_met') {
      setActiveTab('monitor');
    } else {
      setActiveTab('tinder');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customer={customer}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenAgentModal={() => setIsAgentModalOpen(true)}
        notifications={notifications}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'tinder' && (
          <PropertyTinderDeck
            properties={properties}
            customer={customer}
            onShortlistProperty={handleShortlistProperty}
            onPassProperty={handlePassProperty}
            onOptForAgent={(prop) => setIsAgentModalOpen(true)}
            shortlistedProperties={shortlisted}
          />
        )}

        {activeTab === 'monitor' && (
          <PriceMonitor
            customer={customer}
            onOpenAgentModal={() => setIsAgentModalOpen(true)}
          />
        )}

        {activeTab === 'valuation' && (
          <ValuationDashboard
            customer={customer}
            onOpenAgentModal={() => setIsAgentModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {activeTab === 'agent' && (
          <AssignedAgentView
            customer={customer}
            onOpenAgentModal={() => setIsAgentModalOpen(true)}
            onOpenValuation={() => setActiveTab('valuation')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0F0F0F] py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-gray-400 tracking-wider uppercase text-[11px]">
              PropMatch AI • Singapore URA Master Plan & HDB Matchmaking Engine
            </span>
          </div>
          <div className="flex items-center space-x-4 text-gray-400 text-[11px]">
            <span>Residence: <strong className="text-white font-medium">{customer.name}</strong> ({customer.currentProperty.town})</span>
            <span>•</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-semibold underline underline-offset-4"
            >
              Parameters
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        customer={customer}
        onSaveCustomer={handleSaveCustomer}
      />

      <AgentAssignmentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        customer={customer}
        onAssignAgent={handleAssignAgent}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onActionClick={handleNotificationAction}
      />
    </div>
  );
}
